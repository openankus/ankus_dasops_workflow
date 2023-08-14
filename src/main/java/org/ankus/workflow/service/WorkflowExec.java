package org.ankus.workflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.ankus.workflow.model.*;
import org.ankus.workflow.repository.ModuleExecHistRepository;
import org.ankus.workflow.repository.WorkflowExecHistRespository;
import org.ankus.workflow.repository.WorkflowRepository;
import org.ankus.workflow.repository.WorkflowStepExecHistRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 한 워크플로우 실행을 관리하는 객체를 모델링한 클래스
 */
@Slf4j
@Getter
public class WorkflowExec extends Thread{

    /**
     * 실행 중인 워크플로우의 ID
     */
    Long workflowId;

    /**
     * 실행 상태
     */
    ExecStat execStat = ExecStat.NOT_STARTED;

    /**
     * 워크플로우 데이터 접근 객체
     */
    WorkflowRepository workflowRepository;

    /**
     * 워크플로우 실행이력 데이터 접근 객체
     */
    WorkflowExecHistRespository workflowExecHistRespository;

    /**
     * 워크플로우 단계 실행이력 데이터 접근 객체
     */
    WorkflowStepExecHistRepository workflowStepExecHistRepository;

    /**
     * 모듈 실행이력 데이터 접근 객체
     */
    ModuleExecHistRepository moduleExecHistRepository;


    /**
     * 파이썬 실행 유틸 객체
     */
    PythonUtil pythonUtil;


    /**
     * 현재 워크플로우 실행 이력 ID
     */
    Long currentWorkflowExecHistId = null;

    /**
     * 현재 워크플로우 단계 실행 이력 ID
     */
    Long currentWorkflowStepExecHistId = null;

    /**
     * 현재 모듈 실행 이력 ID
     */
    Long currentModuleExecHistId = null;

    /**
     * 워크플로우 실행 관리자
     */
    WorkflowExecManager workflowExecManager;


    /**
     * 생성자
     *
     * @param workflowId    실행할 워크플로우의 ID
     * @param pythonUtil   파이썬 실행 유틸 객체
     * @param workflowRepository     워크플로우 데이터 접근 객체
     * @param workflowExecHistRespository 워크플로우 실행이력 데이터 접근 객체
     * @param workflowStepExecHistRepository 워크플로우 단계 실행이력 데이터 접근 객체
     * @param moduleExecHistRepository 모듈 실행이력 데이터 접근 객체
     * @param
     */
    public WorkflowExec(Long workflowId, PythonUtil pythonUtil,
                        WorkflowRepository workflowRepository, WorkflowExecHistRespository workflowExecHistRespository,
                        WorkflowStepExecHistRepository workflowStepExecHistRepository,
                        ModuleExecHistRepository moduleExecHistRepository,
                        WorkflowExecManager workflowExecManager) {
        this.workflowId = workflowId;
        this.pythonUtil = pythonUtil;
        this.workflowRepository = workflowRepository;
        this.workflowExecHistRespository = workflowExecHistRespository;
        this.workflowStepExecHistRepository = workflowStepExecHistRepository;
        this.moduleExecHistRepository = moduleExecHistRepository;
        this.workflowExecManager = workflowExecManager;
    }


    /**
     * 워크플로우 실행
     */
    public void run() {

        //  워크플로우 실행상태 설정
        this.execStat = ExecStat.RUNNING;

        //  워크플로우 ID 얻기
        Optional<Workflow> optionalWorkflow = workflowRepository.findById(workflowId);
        if (optionalWorkflow.isPresent()){
            //  워크플로우가 존재하는 경우, 관련 워크플로우 실행 Job 실행
            Workflow workflow = optionalWorkflow.get();

            log.debug("워크플로우 실행 시작 - (워크플로우 이름: "+workflow.getName()+")");

            //---<워크플로우 실행이력 등록>---
            WorkflowExecHist workflowExecHist = new WorkflowExecHist();
            //  관련 워크플로우
            workflowExecHist.setWorkflow(workflow);
            //  실행 상태
            workflowExecHist.setExecStat(ExecStat.RUNNING);
            //  시작일시
            workflowExecHist.setStartDateTime(LocalDateTime.now());
            //  워크플로우 설정정보 문자열
            try{
                ObjectMapper objectMapper = new ObjectMapper();
                objectMapper.registerModule(new JavaTimeModule());
                String jsonStr = objectMapper.writeValueAsString(workflow);
                workflowExecHist.setRuntimeConfJson(jsonStr);
            }catch (JsonProcessingException e){
                log.warn("워크플로우 실행 Job 에러", e);
            }

            //  실행이력 저장
            workflowExecHistRespository.save(workflowExecHist);
            currentWorkflowExecHistId = workflowExecHist.getId();
            //---</워크플로우 실행이력 등록>---

            //  가장 최근 워크플로우 단계 실행상태
            ExecStat lastStepExecStat = null;

            //  워크플로우 단계 별로 모듈파일 실행설정 목록을 실행
            for (WorkflowStep workflowStep : workflow.getWorkflowStepList()){

                log.debug("워크플로우 단계 실행 시작 - (워크플로우 이름: "+workflow.getName()+") (단계: "+workflowStep.getNum()+")");

                //---<워크플로우 단계 실행이력 등록>---
                WorkflowStepExecHist workflowStepExecHist = new WorkflowStepExecHist();
                workflowStepExecHist.setWorkflowExecHist(workflowExecHist);
                workflowStepExecHist.setExecStat(ExecStat.RUNNING);
                workflowStepExecHist.setNum(workflowStep.getNum());
                workflowStepExecHistRepository.save(workflowStepExecHist);
                currentWorkflowStepExecHistId = workflowStepExecHist.getId();
                //---</워크플로우 단계 실행이력 등록>---


                //  모듈실행 목록
                List<ModuleExec> moduleExecList = new ArrayList<ModuleExec>();

                //  모듈파일 목록 실행
                List<ModuleExecConf> moduleExecConfList = workflowStep.getModuleExecConfList();
                for (ModuleExecConf moduleExecConf : moduleExecConfList){

                    //  모듈파일 실행객체 생성 및 실행
                    ModuleExec moduleExec =
                            new ModuleExec(moduleExecConf, workflowId, workflow.getName(), workflowStepExecHist,
                                    pythonUtil, moduleExecHistRepository);
                    moduleExec.run();

                    //  모듈실행 등록
                    moduleExecList.add(moduleExec);
                }


                //---<모든 모듈파일 실행상태를 점검하며, 워크플로우 단계 실행 종료 여부를 판단>---
                //  모듈실행이 종료되지 않은 모듈이 있는지 여부
                boolean hasUnfinisedModule = true;
                //  모듈 실행 완료 개수
                int cntComplete = 0;
                //  모듈 실행 실패 개수
                int cntFailed = 0;
                //  모듈 실행 중지 개수
                int cntStopped = 0;
                log.debug("워크플로우 실행 상태 : "+this.execStat);
                while(hasUnfinisedModule){
                    //  주기적으로 모듈실행들의 상태를 점검

                    //  워크플로우 실행 중지 요청에 따른 모듈실행 중지 수행
                    if (ExecStat.STOPPING.equals(this.execStat)){
                        for (ModuleExec moduleExec: moduleExecList){
                            moduleExec.requestStop();
                        }
                    }

                    //  개수 초기화
                    cntComplete = 0;
                    cntFailed = 0;
                    cntStopped = 0;
                    for (ModuleExec moduleExec: moduleExecList){
                        if (ExecStat.COMPLETE.equals(moduleExec.execStat)){
                            cntComplete++;
                        }else if (ExecStat.FAILED.equals(moduleExec.execStat)){
                            cntFailed++;
                        }else if (ExecStat.STOPPED.equals(moduleExec.execStat)){
                            cntStopped++;
                        }
                    }

                    //  워크플로우 단계의 모듈실행 종료 여부 판단
                    if (cntComplete == moduleExecList.size()){
                        //  모든 모듈실행을 완료한 경우,
                        hasUnfinisedModule = false;
                    }else if(cntComplete + cntFailed + cntStopped == moduleExecList.size()){
                        //  모든 모듈실행을 종료(완료, 실패, 중지)한 경우,
                        hasUnfinisedModule = false;
                    }

                    //  다음 점검을 위한 대기
                    try{
                        Thread.sleep(1000);
                    }catch (InterruptedException e){
                        log.warn("모듈파일 실행 후 대기 중 인터럽트 발생", e);
                    }

                }
                //---</모든 모듈파일 실행상태를 점검하며, 워크플로우 단계 실행 종료 여부를 판단>---


                // 워크플로우 단계 실행이력 저장
                if (cntStopped > 0){
                    workflowStepExecHist.setExecStat(ExecStat.STOPPED);
                }else if (cntFailed > 0){
                    workflowStepExecHist.setExecStat(ExecStat.FAILED);
                }else {
                    workflowStepExecHist.setExecStat(ExecStat.COMPLETE);
                }
                workflowStepExecHistRepository.save(workflowStepExecHist);
                lastStepExecStat = workflowStepExecHist.getExecStat();

                log.debug("워크플로우 단계 실행 종료 - (워크플로우 이름: "+workflow.getName()+") (단계: "+workflowStep.getNum()+")");

                if (!ExecStat.COMPLETE.equals(workflowStepExecHist.getExecStat())){
                    //  워크플로우 단계 실행이 완료가 아닌 경우, 실행 중단
                    break;
                }
            }


            //  워크플로우의 마지막 실행상태 및 시각 설정
            workflowExecHist.setExecStat(lastStepExecStat);
            workflowExecHist.setEndDateTime(LocalDateTime.now());
            workflowExecHistRespository.save(workflowExecHist);

            this.execStat = workflowExecHist.getExecStat();


            //  워크플로우 실행종료를 알림
            this.workflowExecManager.informWorkflowExecEnd(this.workflowId);


            log.debug("워크플로우 실행 종료 - (워크플로우 이름: "+workflow.getName()+") (실행상태: "+this.execStat+")");

        }
    }


    /**
     * 워크플로우 실행 중지 요청
     */
    public void requestStop(){
        log.debug("워크플로우 실행 중지 요청 - 워크플로우 ID: "+ workflowId);

        this.execStat = ExecStat.STOPPING;
    }





}
