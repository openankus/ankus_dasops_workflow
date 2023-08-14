package org.ankus.workflow.service;

import lombok.extern.slf4j.Slf4j;
import org.ankus.workflow.model.*;
import org.ankus.workflow.repository.ModuleExecHistRepository;
import org.ankus.workflow.repository.WorkflowExecHistRespository;
import org.ankus.workflow.repository.WorkflowRepository;
import org.ankus.workflow.repository.WorkflowStepExecHistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.transaction.Transactional;
import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 워크플로우 실행을 관리하는 객체를 모델링한 클래스
 */
@Slf4j
@Service
@Transactional
public class WorkflowExecManager {


    /**
     * 실행 중인 워크플로우 실행를 담은 맵(Key: 워크플로우 ID, Value: 워크플로우 실행기)
     */
    private Map<Long, WorkflowExec> runningWorkflowExecMap = new HashMap<Long, WorkflowExec>();


    /**
     * 워크플로우 데이터 접근 객체
     */
    @Autowired
    private WorkflowRepository workflowRepository;

    /**
     * 워크플로우 실행이력 데이터 접근 객체
     */
    @Autowired
    private WorkflowExecHistRespository workflowExecHistRespository;

    /**
     * 워크플로우 단계 실행이력 데이터 접근 객체
     */
    @Autowired
    private WorkflowStepExecHistRepository workflowStepExecHistRepository;

    /**
     * 모듈 실행이력 데이터 접근 객체
     */
    @Autowired
    private ModuleExecHistRepository moduleExecHistRepository;


    /**
     * 파이썬 실행 유틸 객체
     */
    @Autowired
    private PythonUtil pythonUtil;

    /**
     *  워크플로우 실행 이력 최대 보관 일수
     */
    @Value("${ankus.workflow.log.max-days}")
    Long workflowLogMaxDays = null;


    /**
     * 주기적으로(매 10초마다) 워크플로우 실행이력을 정리
     */
    @Scheduled(cron = "0/10 * * * * *")
    public void cleanupWorkflowExecHist(){
        log.debug("실행이력 정리 시작");

        //---<ankus 실행중단으로 종료된 워크플로우 실행이력 처리>---

        {
            //  실행중인 워크플로우 이력 반환
            List<WorkflowExecHist> workflowExecHistList =
                    workflowExecHistRespository.findWorkflowExecHistsByExecStatEquals(ExecStat.RUNNING);

            //  실제 미실행 중인 워크플로우 실행이력의 실행상태를 Failed로 처리
            for (WorkflowExecHist workflowExecHist : workflowExecHistList){
                Long workflowId = workflowExecHist.getWorkflow().getId();

                if (!runningWorkflowExecMap.containsKey(workflowId)){
                    workflowExecHist.setExecStat(ExecStat.FAILED);

                    log.info("Fail로 처리된 워크플로우 실행이력 (workflow ID: "+workflowId+", ID: "+ workflowExecHist.getId()+")");

                    // 워크플로우의 시작시간 혹은 최근 모듈실행의 종료시간으로 처리
                    LocalDateTime maxEndDateTime = workflowExecHist.getStartDateTime();
                    for (WorkflowStepExecHist workflowStepExecHist : workflowExecHist.getWorkflowStepExecHistList()) {
                        for (ModuleExecHist moduleExecHist : workflowStepExecHist.getModuleExecHistList()) {
                            if (moduleExecHist.getEndDateTime() != null
                                    && maxEndDateTime.isBefore(moduleExecHist.getEndDateTime())){
                                maxEndDateTime = moduleExecHist.getEndDateTime();
                            }
                        }
                    }
                    workflowExecHist.setEndDateTime(maxEndDateTime);
                }
            }
        }

        //---</ankus 실행중단으로 종료된 워크플로우 실행 이력 처리>---




        //---<최대 보관일수 기준 워크플로우 실행이력 제거>---
        {
            // 워크플로우 실행이력 만료 일자 추출
            LocalDateTime expiryDateTime = LocalDateTime.now().minusDays(workflowLogMaxDays);

            // 만료된 워크플로우 실행이력 추출
            List<WorkflowExecHist> workflowExecHistList =
                    workflowExecHistRespository.findWorkflowExecHistsByEndDateTimeBefore(expiryDateTime);

            // 만료된 워크플로우 실행이력 삭제
            for (WorkflowExecHist workflowExecHist : workflowExecHistList){
                //  콘솔출력 로그파일 삭제
                for (WorkflowStepExecHist workflowStepExecHist : workflowExecHist.getWorkflowStepExecHistList()){
                    for (ModuleExecHist moduleExecHist : workflowStepExecHist.getModuleExecHistList()){
                        File file = new File(moduleExecHist.getConOutFilePath());
                        file.delete();
                        log.info("콘솔로그 파일 삭제: "+file.getAbsolutePath());
                    }
                }

                // 워크플로우 실행이력 정보 삭제
                workflowExecHistRespository.delete(workflowExecHist);
            }

            // 콘솔출력 로그파일를 담은 폴더 삭제
            String rootLogDirPath = pythonUtil.getAnkusHomeDirPath() + File.separator + "workflow" + File.separator + "con_out";
            File rootLogDir = new File(rootLogDirPath);
            if (rootLogDir.exists()){
                String expiryDateStr = expiryDateTime.format(DateTimeFormatter.BASIC_ISO_DATE);
                for (File file : rootLogDir.listFiles()){
                    if (file.isDirectory() && expiryDateStr.compareTo(file.getName()) >= 1){
                        file.delete();
                        log.info("로그 디렉터리 삭제: "+file.getAbsolutePath());
                    }
                }
            }
        }
        //---</최대 보관일수 기준 워크플로우 실행이력 제거>---

        log.debug("실행이력 정리 완료");
    }


    /**
     *  워크플로우 실행을 요청
     *
     * @param workflowId 워크플로우 ID
     * @param cause 실행 원인
     * @return 워크플로우 실행요청 수락 여부
     */
    public Boolean requestWorkflowRun(Long workflowId, WorkflowExecCause cause){

        boolean hasAccept = false;

        log.debug("워크플로우 실행 요청을 접수하였습니다.(workflow ID: "+ workflowId + ", cause: "+ cause+")");

        if (!runningWorkflowExecMap.containsKey(workflowId)){
            //  해당 워크플로우가 실행 중지 않을 걍우만, 실행

            //  추출된 실행 요청정보를 기반으로  워크플로우 실행 스레드 생성
            WorkflowExec workflowExec =
                    new WorkflowExec(workflowId,
                            this.pythonUtil, this.workflowRepository, this.workflowExecHistRespository,
                            this.workflowStepExecHistRepository,this.moduleExecHistRepository, this);

            //  워크플로우 실행 스레드 실행
            workflowExec.start();

            //  워크플로우 실행기 등록
            runningWorkflowExecMap.put(workflowId, workflowExec);

            //  워크플로우 실행 수락 여부
            hasAccept = true;

            log.debug("워크플로우 실행 요청을 수락하였습니다.(workflow ID: "+ workflowId + ", cause: "+ cause+")");

        }else{
            log.debug("워크플로우 실행 요청을 거절하였습니다.(workflow ID: "+ workflowId + ", cause: "+ cause+")");
        }

        return  hasAccept;
    }


    /**
     *  워크플로우 중지를 요청
     *
     * @param workflowId 워크플로우 ID
     */
    public void requestWorkflowStop(Long workflowId){

        if (runningWorkflowExecMap.containsKey(workflowId)){
            //  기존 워크플로우 실행이 있을 경우,  중지 요청

            log.debug("실행 중단 요청 되었음. workflowId : "+workflowId);

            // 워크플로우 실행 중단
            WorkflowExec workflowExec = runningWorkflowExecMap.get(workflowId);
            workflowExec.requestStop();
        }

    }



    /**
     * 실행 중인 워크플로우 ID 집합 반환
     *
     * @return 실행 중인 ID 집합
     */
    public Set<Long> getRunningWorkflowIdSet(){
        return runningWorkflowExecMap.keySet();
    }


    /**
     * 워크플로우 실행 종료를 알림
     *
     * @param workflowId 실행 종료된 워크플로우 ID
     */
    public void informWorkflowExecEnd(Long workflowId){
        //  워크플로우 실행기 맵에서 제거
        runningWorkflowExecMap.remove(workflowId);
    }




}
