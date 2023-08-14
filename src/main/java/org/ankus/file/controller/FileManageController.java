package org.ankus.file.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.ankus.file.service.FileManageSvc;
import org.ankus.workflow.service.PythonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * 파일을 관리하는 컨트롤러
 */
@Slf4j
@Controller
public class FileManageController {

    /**
     * 사용자 작업공간의 파일을 관리하는 서비스 객체
     */
    @Autowired
    private FileManageSvc fileManageSvc;

    /**
     * 파이썬 유틸 서비스 객체
     */
    @Autowired
    private PythonUtil pythonUtil;



    /**
     * 파일관리 UI
     *
     * @return
     */
    @RequestMapping(value = "file")
    public String fileManager(){
        return "file/file";
    }

    /**
     * 자식 디렉토리 목록 반환하는 REST API
     *
     * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @return 자식 디렉토리 목록 JSon 문자열(for fancy tree)
     */
    @RequestMapping(value = "file/listChildDir")
    @ResponseBody
    public String getChildDirList(@RequestParam String parentDirPath){

        List<File> childDirFileList = fileManageSvc.getChildDirList(parentDirPath);

        List<Map<String, Object>> childChildList = new ArrayList<Map<String, Object>>();
        for (File tmpFile : childDirFileList){

            //  child 디렉터리 정보 생성
            Map<String, Object> childDir = new HashMap<String, Object>();
            childDir.put("title", tmpFile.getName());
            childChildList.add(childDir);
        }


        //  JSON 문자열 만들기
        String retJson = null;
        try{
            retJson = new ObjectMapper().writeValueAsString(childChildList);

        }catch (JsonProcessingException e){
            log.warn("자식 디렉토리 목록을 Json 문자열 변환 중 에러 발생",e);
        }
//        System.out.println(retJson);
        return retJson;
    }

    /**
     * 자식 파일 목록 반환하는 REST API
     *
     * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @return 자식 파일 목록 JSon 문자열(for DataTables)
     */
    @RequestMapping(value ="file/listChildFile")
    @ResponseBody
    public String getChildFileList(@RequestParam String parentDirPath){

        List<File> childDirFileList = fileManageSvc.getChildFileList(parentDirPath);


        List<Map> childList = new ArrayList<Map>();
        for (File tmpFile : childDirFileList){

            //  child 디렉터리 정보 생성
            Map<String, String> map = new HashMap<>();



            map.put("name",tmpFile.getName());
            try{
                FileTime lastModTime = Files.getLastModifiedTime(Paths.get(tmpFile.getAbsolutePath()));
                LocalDateTime localDateTime =
                        lastModTime.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
                //  파일 수정일시
                map.put("date",localDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH HH:mm:ss")));
            }catch (IOException e){
                log.warn("파일관리에서 파일수정시간 조회 중 에러",e);
                map.put("date","-");
            }
            //  파일 경로(파일 열기용)
            String childFilePath = parentDirPath+"/"+tmpFile.getName();
            if (parentDirPath.equals("/")){
                childFilePath = "/"+tmpFile.getName();
            }
            map.put("path",childFilePath);

            //  파일 이름(삭제용)
            map.put("del",tmpFile.getName());

            childList.add(map);
        }

        //  JSON 문자열 만들기
        String retJson = null;
        try{
            retJson = new ObjectMapper().writeValueAsString(childList);

        }catch (JsonProcessingException e){
            log.warn("Json 문자열 변환 중 에러 발생",e);
        }
        return retJson;
    }


    /**
     * JupyterLab 열기용 URL을 반환하는 REST API
     *
     * @param filePath 파일경로(사용자 작업공간 기준 상대경로)
     * @return
     */
    @RequestMapping(value ="file/getJupyterlabUrl")
    @ResponseBody
    public String getJupyterlabUrl(HttpServletRequest request, @RequestParam String filePath){

        //  파일 경로
        File file = new File(pythonUtil.getAnkusJupyterWorkspace(), filePath);
        System.out.println(request.getServerName()+" , "+file.getAbsolutePath());
        //  주피터랩용 파일열기 경로 얻기
        String jupyterlabUrl = pythonUtil.getJupyterlabUrl(request.getServerName(), file.getAbsolutePath());

        return jupyterlabUrl;
    }


    /**
     * 디렉터리를 생성하는 REST API
     *
     * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @param dirName   생성할 디렉터리(폴더) 이름
     * @return 생성 여부
     */
    @RequestMapping(value ="file/createDir")
    @ResponseBody
    public String createDir(@RequestParam String parentDirPath, @RequestParam String dirName){

        return fileManageSvc.createDir(parentDirPath, dirName);
    }




    /**
     * 디렉터리를 삭제하는 REST API
     *
     * @param dirPath 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @return 삭제 여부
     */
    @RequestMapping(value ="file/deleteDir")
    @ResponseBody
    public String deleteDir(@RequestParam String dirPath){

        return fileManageSvc.deleteDir(dirPath);
    }



    /**
     * 파일을 업로드하는 REST API
     *
     * @param request 요청 정보를 담은 객체
     * @return 삭제 여부
     */
    @RequestMapping(value ="file/uploadFile")
    @ResponseBody
    public String uploadFile(MultipartHttpServletRequest request){

        //  저장할 부모 디렉터리 경로
        String parentDirPath = request.getParameter("parentDirPath");
        boolean flag = false;
        if (parentDirPath != null){

            for(MultipartFile mf : request.getFiles("uploadFile")){
                flag = fileManageSvc.saveFile(parentDirPath,mf);
            }

        }



        //  JSON 문자열 만들기
        String retJson = null;
        try{
            retJson = new ObjectMapper().writeValueAsString(flag);
        }catch (JsonProcessingException e){
            log.warn("Json 문자열 변환 중 에러 발생",e);
        }

        return retJson;
    }


    /**
     * 파일을 삭제하는 REST API
     *
     * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @param fileNameList 삭제할 파일들의 이름 목록
     * @return
     */
    @RequestMapping(value ="file/deleteFile")
    @ResponseBody
    public String deleteFile(@RequestParam String parentDirPath,
                             @RequestParam(value = "fileNameList[]") List<String> fileNameList){

        boolean flag = fileManageSvc.deleteFile(parentDirPath, fileNameList);


        //  JSON 문자열 만들기
        String retJson = null;
        try{
            retJson = new ObjectMapper().writeValueAsString(flag);
        }catch (JsonProcessingException e){
            log.warn("Json 문자열 변환 중 에러 발생",e);
        }

        return retJson;
    }



    /**
     * 파일을 다운로드하는 REST API
     *
     * @param parentDirPath 부모 디렉터리 경로(사용자 작업공간 기준 상대경로)
     * @param fileNameList 다운로드할 파일들의 이름 목록
     * @return
     */
    @RequestMapping(value ="file/downloadFile")
    @ResponseBody
    public void downloadFile(@RequestParam String parentDirPath,
                            @RequestParam(value = "fileNameList[]") List<String> fileNameList,
                            HttpServletResponse response, Object handler, HttpServletRequest request) {

        try{


            //  다운로드할 파일들을 압축
            File zipFile = null;

            //파일다운로드 START
            if(fileNameList.size() == 1) {
                System.out.println(fileNameList.get(0));
                zipFile = new File(fileManageSvc.createFilePath(parentDirPath),fileNameList.get(0));
                response.setContentType("application/octet-stream");
                response.addHeader("Set-Cookie", "fileDownload=true; path=/");
                response.addHeader("Cache-Control", "no-cache, no-store, must-revalidate");

                String header = request.getHeader("User-Agent");
                String fileName;
                if ((header.contains("MSIE")) || (header.contains("Trident")) || (header.contains("Edge"))) {
                    //인터넷 익스플로러 10이하 버전, 11버전, 엣지에서 인코딩
                    fileName = URLEncoder.encode(fileNameList.get(0), "UTF-8");
                } else {
                    //나머지 브라우저에서 인코딩
                    fileName = new String(fileNameList.get(0).getBytes("UTF-8"), "iso-8859-1");
                }
                response.addHeader("Content-Disposition","attachment;filename="+ fileName);
            }else{
                zipFile = new File(fileManageSvc.createCompressFile(parentDirPath.equals("/")?"":parentDirPath, fileNameList));
                response.setContentType("application/zip");
                response.addHeader("Set-Cookie", "fileDownload=true; path=/");
                response.addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                response.addHeader("Content-Disposition", "attachment;filename=downloadFile.zip");
            }


            FileInputStream fis = new FileInputStream(zipFile);



            BufferedInputStream bis = new BufferedInputStream(fis);
            ServletOutputStream so = response.getOutputStream();
            BufferedOutputStream bos = new BufferedOutputStream(so);

            //  다운로드 압축파일을 읽기
            int n = 0;
            byte[] buffer = new byte[1024];
            while((n = bis.read(buffer)) > 0){
                bos.write(buffer, 0, n);
                bos.flush();
            }

            if(bos != null) bos.close();
            if(bis != null) bis.close();
            if(so != null) so.close();
            if(fis != null) fis.close();
            //파일다운로드 END

            // 압축파일 삭제
            if(fileNameList.size() != 1) zipFile.delete();
        }catch(IOException e){
           log.warn("파일 다운로드 중 에러 발생", e);
        }
    }

    @RequestMapping(value ="file/downloadFile2")
    @ResponseBody
    public ResponseEntity<byte[]> downloadFile2(@RequestParam String parentDirPath,
                                                @RequestParam(value = "fileNameList[]") List<String> fileNameList,
                                                HttpServletResponse response) throws IOException {
        String retFilePath = null;

        //  부모 디렉터리
        File dir = new File("C:/Users/ejrtn/ankus_user_workspace/", parentDirPath);

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

            byte[] zoutFile = zout.toString().getBytes("UTF-8");

            HttpHeaders header = new HttpHeaders();
            header.setContentType(MediaType.valueOf("text/zip"));
            header.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=downloadFile.zip");

            return new ResponseEntity<byte[]>(zoutFile, header, HttpStatus.OK);
        }catch (IOException e){
            log.warn("다운로드 파일 압축 중 에러 발생", e);

            // 실패한 파일 삭제
            zipFilePath.toFile().delete();
        }finally {
            if (zout != null){
                zout = null;
            }
        }
        HttpHeaders header = new HttpHeaders();
        header.setContentType(MediaType.valueOf("text/zip"));
        return new ResponseEntity<byte[]>(null, header, HttpStatus.OK);

    }

    @RequestMapping(value ="file/existsFile")
    @ResponseBody
    public boolean existsFile(@RequestParam String parentDirPath,@RequestParam String fileName){
        return fileManageSvc.existsFile(parentDirPath,fileName);
    }

    @RequestMapping(value ="file/nameChange")
    @ResponseBody
    public boolean nameChange(@RequestParam String parentDirPath,@RequestParam String fileName,@RequestParam String fileName2){
        return fileManageSvc.nameChange(parentDirPath,fileName,fileName2);
    }

}
