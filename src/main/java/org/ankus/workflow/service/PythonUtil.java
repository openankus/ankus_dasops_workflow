package org.ankus.workflow.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * 파이썬 실행 유틸 서비스 파일
 */
@Slf4j
@Service
public class PythonUtil {

    /**
     * ankus 설정 및 로깅을 담은 홈디렉터리
     */
    @Value("${ankus.home}")
    String ankusHome;


    /**
     * 사용자 작업공간 디렉터리
     */
    @Value("${ankus.jupyter.workspace}")
    String ankusJupyterWorkspace;


    /**
     * Jupyterlab 서비스 포트 번호
     */
    @Value("${ankus.jupyter.port}")
    Long juptyerlabPort = null;

    /**
     * 윈도우 실행환경에서 conda 활성화를 위한 명령어
     */
    @Value("${ankus.windows.conda.activate_cmd}")
    String windowsCondaActivateCmd;


    /**
     * Ankus home 디렉터리 경로 얻기
     *
     * @return
     */
    public String getAnkusHomeDirPath(){
        return ankusHome;
    }


    /**
     * 사용자 작업공간 디렉토리 생성
     */
    public void createUserWorkspace(){

        File homeFile = new File(ankusJupyterWorkspace);
        if (!homeFile.exists()){
            homeFile.mkdirs();
        }else if (homeFile.isFile()){
            log.error("사용자 작업공간 디렉토리를 생성할 수 없습니다. (생성경로: "+ ankusJupyterWorkspace +" )");
        }

    }




    /**
     * 특정 파일을 Jupyterlab으로 열기 위한 접근 URL을 반환
     *
     * @param serverName 웹 브라우저가 바라보는 서버의 호스트명(즉, IP)
     * @param absoluteFilePath  파일 절대 경로
     * @return
     */
    public String getJupyterlabUrl(String serverName, String absoluteFilePath){

        //  사용자 작업공간 디렉터리 생성
        createUserWorkspace();

        //  작업공간 절대경로 부분을 제거한 상대경로 추출
        String cvfilePath = absoluteFilePath.replace(File.separator, "/");
        String cvtAnkusUserworkSpace = ankusJupyterWorkspace.replace(File.separator, "/");
        String relPath = cvfilePath.substring(cvtAnkusUserworkSpace.length());

        //  접근 URL 생성
        StringBuffer sb = new StringBuffer();
        sb.append("http://");

        sb.append(serverName);
        sb.append(":");
        sb.append(juptyerlabPort.toString());
        sb.append("/lab");
        sb.append("/tree/");
        sb.append(relPath);
//        sb.append("?token=");
//        sb.append(jupyerlabToken);

        return sb.toString();
    }

    /**
     * 사용자 작업공간 디렉터리 경로 반환
     *
     * @return
     */
    public String getAnkusJupyterWorkspace(){
        return this.ankusJupyterWorkspace;
    }



    public String getWindowsCondaActivateCmd(){return this.windowsCondaActivateCmd;}

    /**
     * 실행환경정보 문자열을 반환
     *
     * @return
     */
    public String getRuntimeEnvInfo(){

        StringBuffer runtimeEnvInfo = new StringBuffer();
        //  Java 버전
        {
            String[] commandLine = {"java", "-version"};
            String conOut = this.runCommandLine(commandLine);
            runtimeEnvInfo.append("=======================================");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("  Java Version");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("---------------------------------------");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append(conOut);
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("=======================================");
            runtimeEnvInfo.append("\n");
        }

        runtimeEnvInfo.append("\n");
        runtimeEnvInfo.append("\n");
        runtimeEnvInfo.append("\n");

        //  Python 버전
        {
            String[] commandLine = {"python3", "--version"};
            String conOut = this.runCommandLine(commandLine);
            runtimeEnvInfo.append("=======================================");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("  Python Version");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("---------------------------------------");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append(conOut);
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("=======================================");
            runtimeEnvInfo.append("\n");
        }

        runtimeEnvInfo.append("\n");
        runtimeEnvInfo.append("\n");
        runtimeEnvInfo.append("\n");

        //  Python 패키지 버전
        {
            String[] commandLine = {"pip3", "list"};
            String conOut = this.runCommandLine(commandLine);
            runtimeEnvInfo.append("=======================================");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("  Python Package List");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("---------------------------------------");
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append(conOut);
            runtimeEnvInfo.append("\n");
            runtimeEnvInfo.append("=======================================");
            runtimeEnvInfo.append("\n");
        }

        return runtimeEnvInfo.toString();
    }


    /**
     * 명령어줄을 실행 및 관련 콘솔 출력결과를 반환
     *
     * @return 콘솔 출력 결과
     */
    public String runCommandLine(String[] commandLine){
        //  콘솔출력결과를 담는 스트링버퍼
        StringBuffer conOutStringBuffer = new StringBuffer();

        try{
            ProcessBuilder builder = new ProcessBuilder(commandLine);
            builder.redirectErrorStream(true);
//            builder.redirectOutput(ProcessBuilder.Redirect.INHERIT);
//            builder.redirectError(ProcessBuilder.Redirect.INHERIT);
            // 프로세스 실행
            Process process = builder.start();

            // 콘솔출력 결과 담기
            BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String tmpLine = null;
            while ((tmpLine = br.readLine()) != null){
                conOutStringBuffer.append(tmpLine);
                conOutStringBuffer.append("\n");

                System.out.println(tmpLine);
            }

            //  프로세스가 끝날때까지 대기
            process.waitFor();

            //  리턴값 받기
            int retVal = process.exitValue();
        }catch (IOException | InterruptedException e){
            e.printStackTrace();
        }

        return conOutStringBuffer.toString();
    }



}
