package org.ankus.workflow.service;

import lombok.extern.slf4j.Slf4j;
import org.ankus.workflow.model.ExecStat;
import org.ankus.workflow.model.ModuleExecConf;
import org.ankus.workflow.model.ModuleExecHist;
import org.ankus.workflow.model.WorkflowStepExecHist;
import org.ankus.workflow.repository.ModuleExecHistRepository;
import org.apache.commons.exec.*;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * 한 모듈실행을 관리하는 객체를 모델링한 클래스
 */
@Slf4j
public class ModuleExec {

    /**
     *  실행하려는 모듈실행 실행설정
     */
    ModuleExecConf moduleExecConf;

    /**
     * 모듈실행 실행설정과 관련된 workflow ID
     */
    Long workflowId;

    /**
     * 워크플로우 이름
     */
    String workflowName;

    /**
     *  현재 모듈실행과 관련된 워크플로우 단계 실행 이력
     */
    WorkflowStepExecHist workflowStepExecHist;

    /**
     * 실행 상태
     */
    ExecStat execStat = ExecStat.NOT_STARTED;

    /**
     * 모듈 실행이력 데이터 접근 객체
     */
    ModuleExecHistRepository moduleExecHistRepository;


    /**
     * 파이썬 실행 유틸 객체
     */
    PythonUtil pythonUtil;


    /**
     * 명령어 실행기
     */
    DefaultExecutor defaultExecutor = new DefaultExecutor();


    /**
     * 모듈 실행 이력 ID
     */
    Long moduleExecHistId = null;


    /**
     * 생성자
     *
     * @param moduleExecConf 실행할 모듈파일 실행설정
     * @param workflowId 워크플로우 ID
     * @param workflowName 워크플로우 ID
     * @param pythonUtil   파이썬 실행 유틸 객체
     * @param workflowStepExecHist 관련 워크플로우 단계 실행이력
     * @param moduleExecHistRepository 모듈 실행이력 데이터 접근 객체
     */
    public ModuleExec(ModuleExecConf moduleExecConf, Long workflowId, String workflowName, WorkflowStepExecHist workflowStepExecHist,
                      PythonUtil pythonUtil, ModuleExecHistRepository moduleExecHistRepository) {
        this.moduleExecConf = moduleExecConf;
        this.workflowId = workflowId;
        this.workflowName = workflowName;
        this.workflowStepExecHist = workflowStepExecHist;
        this.pythonUtil = pythonUtil;
        this.moduleExecHistRepository = moduleExecHistRepository;
    }

    /**
     * 모듈파일 실행
     */
    public void run(){

        log.debug("모듈실행 시작 (워크플로우 이름: "+workflowName+") (모듈실행 설정 이름: "+ moduleExecConf.getName()+")");


        //  모듈실행 상태 = 실행 중
        this.execStat = ExecStat.RUNNING;


        //---<명령어 줄 생성>---
        List<String> cmdLineList = new ArrayList<String>();
        String os = System.getProperty("os.name").toLowerCase(Locale.ROOT);
        if (os.contains("win")){
            //  윈도우 실행을 위한 설정
            cmdLineList.add("cmd.exe");
            cmdLineList.add( "/c");
        }


        // 모듈파일의 경로
        File cmdFile = new File(pythonUtil.getAnkusJupyterWorkspace(), this.moduleExecConf.getModuleFilePath());

        if (this.moduleExecConf.getModuleFilePath().endsWith(".py")){
            //  Python 파일의 경우

            // Python 모듈 실행 명령
            if (os.contains("win")){
                // 윈도우에서 실행 설정

                //  mini-conda 실행환경 설정
                cmdLineList.add(pythonUtil.getWindowsCondaActivateCmd());
                cmdLineList.add("&&");

                cmdLineList.add("python");
            }else{
                // 리눅스에서 실행 설정
                cmdLineList.add("python3");
            }

            cmdLineList.add(cmdFile.getAbsolutePath());

            //  모듈파일 실행 관련 명령어 인자 추가
            cmdLineList.addAll(this.moduleExecConf.getCmdArgList());
        }else if (this.moduleExecConf.getModuleFilePath().endsWith(".ipynb")){
            //  Jupyter Notebook 파일의 경우

            // Python 모듈 실행 명령
            if (os.contains("win")) {
                // 윈도우에서 실행 설정
                //  mini-conda 실행환경 설정
                cmdLineList.add(pythonUtil.getWindowsCondaActivateCmd());
                cmdLineList.add("&&");
            }

            // jupyter notebook 모듈 실행 명령
            cmdLineList.add("jupyter");
            cmdLineList.add("nbconvert");
            cmdLineList.add("--execute");
            cmdLineList.add(cmdFile.getAbsolutePath());
            cmdLineList.add("--to");
            cmdLineList.add("asciidoc");
            cmdLineList.add("--stdout");
        }else if (this.moduleExecConf.getModuleFilePath().endsWith(".jar")){
            //  JAR 파일의 경우

            // JAR 모듈 실행 명령
            cmdLineList.add("java");
            cmdLineList.add("-jar");
            cmdLineList.add(cmdFile.getAbsolutePath());

            //  모듈파일 실행 관련 명령어 인자 추가
            cmdLineList.addAll(this.moduleExecConf.getCmdArgList());

        }else{
            //  그외 일반 실행파일의 경우,
            cmdLineList.add(cmdFile.getAbsolutePath());

            //  모듈파일 실행 관련 명령어 인자 추가
            cmdLineList.addAll(this.moduleExecConf.getCmdArgList());
        }


        CommandLine cmdLine = CommandLine.parse(cmdLineList.get(0));
        for (int idx=1, n=cmdLineList.size() ; idx<n ; idx++ ) {
            cmdLine.addArgument(cmdLineList.get(idx));
        }
        //---</명령어 줄 생성>---

        //  스레드 실행이 가능한 경우,
        //---<모듈 실행이력 등록>---
        ModuleExecHist moduleExecHist = new ModuleExecHist();
        moduleExecHist.setWorkflowStepExecHist(workflowStepExecHist);
        moduleExecHist.setNum(moduleExecConf.getNum());
        moduleExecHist.setName(moduleExecConf.getName());
        moduleExecHist.setStartDateTime(LocalDateTime.now());
        moduleExecHist.setExecStat(ExecStat.RUNNING);
        moduleExecHist.setCmdLine(cmdLine.toString());


        try{
            //  콘솔 출력결과 파일 경로 설정
            String conOutFileName =
                    "workflow_"+this.workflowId+"_mod_"+moduleExecConf.getId()+"_"+
                            LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH_mm_ss"))+".txt";
            String conOutFilePath = this.createConsoleOutFile(conOutFileName);
            moduleExecHist.setConOutFilePath(conOutFilePath);


            //	명령어 콘솔출력을 저장할 outputstream 설정
            FileOutputStream fos = new FileOutputStream(conOutFilePath);
            PumpStreamHandler streamHandler = new PumpStreamHandler(fos);
            defaultExecutor.setStreamHandler(streamHandler);

        }catch (IOException e){
            log.warn("모듈실행 콘솔출력 결과 파일 생성 중 에러", e);
        }

        //  모듈실행 상태 설정
        this.execStat = moduleExecHist.getExecStat();

        moduleExecHistRepository.save(moduleExecHist);
        //  중지 요청 처리를 위해 실행이력 ID 저장
        moduleExecHistId = moduleExecHist.getId();
        //---</모듈 실행이력 등록>---


        log.debug("실행 명령어\n"+cmdLine.toString());



        //  명령어 줄 실행
        try{

            //  콘솔 출력결과를 담는 Watchdog 설정

            //  비동기 명령어 실행을 감시할 객체 설정
            ExecuteWatchdog watchdog = new ExecuteWatchdog(ExecuteWatchdog.INFINITE_TIMEOUT);
            defaultExecutor.setWatchdog(watchdog);
            //  실행 디렉터리 설정
            defaultExecutor.setWorkingDirectory(cmdFile.getParentFile());



            //  명령어 줄 실행(비동기 실행)
            defaultExecutor.execute(cmdLine, new ExecuteResultHandler() {
                @Override
                public void onProcessComplete(int exitValue) {
                    //  모듈 실행 완료의 경우,

                    //  모듈 실행이력 저장
                    moduleExecHist.setExecStat(ExecStat.COMPLETE);
                    moduleExecHist.setEndDateTime(LocalDateTime.now());
                    moduleExecHistRepository.save(moduleExecHist);
                    execStat = ExecStat.COMPLETE;
                    log.debug("모듈실행 완료 (워크플로우 이름: "+workflowName+") (모듈실행 설정 이름: "+ moduleExecConf.getName()+")");
                }

                @Override
                public void onProcessFailed(ExecuteException e) {
                    //  모듈 실행 실패의 경우,

                    //  모듈 실행이력 저장
                    moduleExecHist.setExecStat(ExecStat.FAILED);
                    if (ExecStat.STOPPING.equals(execStat)){
                        //  모듈 실행 중지 요청에 의한 실패한 경우,
                        moduleExecHist.setExecStat(ExecStat.STOPPED);

                        log.debug("모듈실행 중지 (워크플로우 이름: "+workflowName+") (모듈실행 설정 이름: "+ moduleExecConf.getName()+")");
                    }else{
                        //  일반적인 모듈 실행 실패한 경우,
                        moduleExecHist.setErrMsg(e.getMessage());

                        log.error("모듈실행 실패 (워크플로우 이름: "+workflowName+") (모듈실행 설정 이름: "+ moduleExecConf.getName()+")\n(실행명령어: "+moduleExecHist.getCmdLine()+")", e);

                    }
                    moduleExecHist.setEndDateTime(LocalDateTime.now());
                    moduleExecHistRepository.save(moduleExecHist);
                    execStat = moduleExecHist.getExecStat();
                }
            });


        }catch (IOException e){
            //  모듈 실행 실패의 경우,

            //  모듈 실행이력 저장
            moduleExecHist.setExecStat(ExecStat.FAILED);
            moduleExecHist.setEndDateTime(LocalDateTime.now());
            moduleExecHist.setErrMsg(e.getMessage());
            moduleExecHistRepository.save(moduleExecHist);
            execStat = moduleExecHist.getExecStat();

            log.error("워크플로우의 모듈실행 중 에러", e);
        }

    }


    /**
     * 모듈실행 중지 요청
     */
    public void requestStop(){
        log.debug("모듈실행 중지 요청 - 모듈실행 설정 이름: "+ moduleExecConf.getName());
        if (ExecStat.RUNNING.equals(execStat)){
            //  실행 중에만 중지처리


            //  모듈실행 중지 중
            this.execStat = ExecStat.STOPPING;

            //  모듈실행 이력 저장
            ModuleExecHist moduleExecHist = moduleExecHistRepository.getById(moduleExecHistId);
            if (moduleExecHist != null){
                moduleExecHist.setExecStat(this.execStat);
                moduleExecHist.setEndDateTime(LocalDateTime.now());
                moduleExecHistRepository.save(moduleExecHist);
            }

            //  모듈실행 프로세스 kill
            defaultExecutor.getWatchdog().destroyProcess();
        }
    }



    /**
     * 콘솔출력 파일 생성
     *
     * @param fileName 파일명
     * @return 파일 절대경로
     * @throws IOException
     */
    private String createConsoleOutFile(String fileName) throws IOException{

        //  콘솔출력 파일을 담는 디렉터리 생성
        String logDirPath = pythonUtil.getAnkusHomeDirPath() + File.separator + "workflow" + File.separator + "con_out"
                + File.separator + LocalDateTime.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        File logDir = new File(logDirPath);
        logDir.mkdirs();




        //  콘솔출력을 담을 파일 경로
        File outFile = new File(logDir, fileName);
//        log.info("콘솔출력 파일경로: "+outFile.getAbsolutePath());
        outFile.createNewFile();

        return outFile.getAbsolutePath();
    }


}
