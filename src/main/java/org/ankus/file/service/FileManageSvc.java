package org.ankus.file.service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * 사용자 작업공간의 파일을 관리하는 서비스 객체
 */
@Slf4j
@Service
public class FileManageSvc {

    /**
     * 사용자 작업공간 디렉터리
     */
    @Value("${ankus.jupyter.workspace}")
    private String ankusUserWorkspace;

    /**
     * 초기화
     */
    @PostConstruct
    public void init(){

        // 사용자 작업공간 디렉터리 file
        File ankusUserWorkspaceFile = new File(this.ankusUserWorkspace);

        if (!ankusUserWorkspaceFile.exists() || !ankusUserWorkspaceFile.isDirectory()){
            //  사용자 작업공간 디렉터리가 없는 경우에 생성
            ankusUserWorkspaceFile.mkdirs();
        }
    }


    /**
     * 자식 디렉토리 목록 반환
     * 
     * @param parentDirPath 부모 디렉토리 경로(사용자 작업공간 기준 상대경로)
     * @return 자식 디렉터리 파일
     */
    public List<File> getChildDirList(String parentDirPath){
        
        // 사용자 작업공간 디렉터리
        File ankusUserWorkspaceFile = new File(this.ankusUserWorkspace);

        // 조회하고자 하는 디렉터리 경로
        File searchFolderPath = new File(ankusUserWorkspaceFile, parentDirPath);

        List<File> retList = new ArrayList<File>();
        for (File tmpFile : searchFolderPath.listFiles()){
            if (tmpFile.isDirectory() && !tmpFile.getName().startsWith(".")){
                //  디렉터리이며, 은닉 파일이 아닌 경우만 추가
                retList.add(tmpFile);
            }
        }

        return  retList;
    }


    /**
     * 자식 파일 목록 반환
     *
     * @param parentDirPath 부모 디렉토리 경로(사용자 작업공간 기준 상대경로)
     * @return 자식 파일 목록
     */
    public List<File> getChildFileList(String parentDirPath){

        // 사용자 작업공간 디렉터리
        File ankusUserWorkspaceFile = new File(this.ankusUserWorkspace);

        // 조회하고자 하는 디렉터리 경로
        File searchFolderPath = new File(ankusUserWorkspaceFile, parentDirPath);

        List<File> retList = new ArrayList<File>();
        if(searchFolderPath.listFiles() != null) {
            for (File tmpFile : searchFolderPath.listFiles()) {
                if (tmpFile.isFile()) {
                    retList.add(tmpFile);
                }
            }
        }

        return  retList;
    }


    /**
     * 사용자 작업공간 디렉터리를 생성
     *
     * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @param dirName   생성할 디렉터리(폴더) 이름
     * @return 생성 여부
     */
    public String createDir(String parentDirPath, String dirName){
        try {
            //  부모 디렉터리
            File parentDir = new File(ankusUserWorkspace, parentDirPath);
            if (new File(parentDir,dirName).exists()) {
                return "해당 이름이 이미 존재 합니다";
            }else{
                //  자식 디렉터리
                File childDir = new File(parentDir, dirName);
                childDir.mkdirs();
                return "완료";
            }
        }catch (Exception e){
            return e.getMessage();
        }




    }



    /**
     * 사용자 작업공간 디렉터리를 삭제
     *
     * @param dirPath 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @return 삭제 여부
     */
    public String deleteDir(String dirPath){



        try{
            //  실제 디렉터리
            File dir = new File(ankusUserWorkspace, dirPath);
            if(dir.listFiles().length>0){
                return "폴더 안에 폴더 또는 파일을 먼저 삭제해주세요";
            }else{
                dir.delete();
                return "완료";
            }

        }catch (Exception e){
            return e.getMessage();
        }


    }


    /**
     * 파일 저장
     * 
     * @param parentDirPath  부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @param uploadFile 저장할 파일
     * @return 저장 여부
     */
    public boolean saveFile(String parentDirPath, MultipartFile uploadFile){

        //  부모 디렉터리
        File dir = new File(ankusUserWorkspace, parentDirPath);

        //  저장할 파일 경로
        File saveFile = new File(dir, uploadFile.getOriginalFilename());

        boolean flag = false;
        try{
            //  파일 저장
            uploadFile.transferTo(saveFile);
            flag = true;
        }catch (IOException e){
            log.warn("파일 저장 중 에러 발생", e);
        }

        return flag;
    }


    /**
     * 파일 삭제
     *
     * @param parentDirPath  부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @param fileNameList 삭제할 파일 이름 목록
     * @return 삭제 여부
     */
    public boolean deleteFile(String parentDirPath, List<String> fileNameList){
        //  부모 디렉터리
        File dir = new File(ankusUserWorkspace, parentDirPath);

        boolean flag = false;
        for (String fileName : fileNameList){
            File saveFile = new File(dir, fileName);
            flag = saveFile.delete();
            if (!flag)
                break;
        }

        return flag;
    }


    /**
     * 압축파일 생성
     *
     * @param parentDirPath  부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @param fileNameList 압축할 파일 이름 목록
     * @return
     * @throws IOException
     */
    public String createCompressFile(String parentDirPath, List<String> fileNameList) throws IOException{
//  반환할 압축파일 경로
        String retFilePath = null;

        //  부모 디렉터리
        File dir = new File(ankusUserWorkspace, parentDirPath);

        //  Zip 파일 저장할 경로
        Path zipFilePath = Files.createTempFile("download_", ".zip");		//임시 ZIP 압축 파일명
        ZipOutputStream zout = new ZipOutputStream(new FileOutputStream(zipFilePath.toFile()));
        try{

            //ZIP파일 압축 START
            byte[] buffer = new byte[1024];
            FileInputStream in = null;

            for (String fileName : fileNameList){

                in = new FileInputStream(new File(dir, fileName));		//압축 대상 파일
                zout.putNextEntry(new ZipEntry(fileName));	//압축파일에 저장될 파일명
//                System.out.println(fileName);
//                float total_size = in.available();
//                float size_ing = 0;
                int len;
                while((len = in.read(buffer)) > 0){
//                    size_ing += len;
//                    System.out.printf("%.2f\n",size_ing/total_size*100);
                    zout.write(buffer, 0, len);			//읽은 파일을 ZipOutputStream에 Write
                }

                zout.closeEntry();
                in.close();
            }

            retFilePath = zipFilePath.toFile().getAbsolutePath();

            //ZIP파일 압축 END

            // zip 파일 아웃풋 스트림 닫기
            zout.close();

        }catch (IOException e){
            log.warn("다운로드 파일 압축 중 에러 발생", e);

            // 실패한 파일 삭제
            zipFilePath.toFile().delete();
        }finally {
            if (zout != null){
                zout = null;
            }
        }

        return  retFilePath;

    }

    /**
     * 해당 위치에 파일이 있는지 확인
     * @param parentDirPath
     * @param fileName
     * @return
     */
    public boolean existsFile(String parentDirPath, String fileName) {

        //  부모 디렉터리
        File dir = new File(ankusUserWorkspace, parentDirPath);

        return new File(dir, fileName).exists() && new File(dir, fileName).isFile();
    }


    /**
     * 파일 경로 생성
     * @param parentDirPath
     * @return
     */
    public String createFilePath(String parentDirPath){
        return new File(ankusUserWorkspace, parentDirPath).getAbsolutePath();
    }

    public boolean nameChange(String parentDirPath, String fileName, String fileName2){
        File file = new File(new File(ankusUserWorkspace+parentDirPath).getPath(),fileName);
        return  file.renameTo(new File(ankusUserWorkspace+parentDirPath,fileName2));

    }
}
