package org.ankus.workflow.service;

import lombok.extern.slf4j.Slf4j;
import org.ankus.workflow.model.*;
import org.ankus.workflow.repository.WorkflowRepository;
import org.quartz.CronScheduleBuilder;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ScheduledFuture;


/**
 * 시간주기 워크플로우 실행 요청기
 */
@Slf4j
@Service
public class PeriodWorkflowExecRequestor {

    /**
     * 워크플로우 데이터 접근 객체
     */
    @Autowired
    WorkflowRepository workflowRepository;


    /**
     * 시간주기 실행조건 워크플로우의 실행요청을 관리하는 스케줄러
     */
    ThreadPoolTaskScheduler scheduler;
    TaskScheduler taskScheduler;

    /**
     * 워크플로우의 이전 갱신일시를 담은 맵
     */
    Map<Long, LocalDateTime> prevWorkflowUpdateDateTimeMap = new HashMap<Long, LocalDateTime>();

    /**
     * 워크플로우의 실행 스케줄을 담은 맵
     */
    Map<Long, ScheduledFuture> workflowExecScheduleMap = new HashMap<Long, ScheduledFuture>();

    /**
     * 현재 실행 중인 워크플로우 실행을 담은 맵
     */
    Map<Long, WorkflowExec> runningWorkflowExecMap = new HashMap<Long, WorkflowExec>();

    /**
     * 워크플로우 실행 관리자
     */
    @Autowired
    WorkflowExecManager workflowExecManager;



    public PeriodWorkflowExecRequestor(){
        scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.initialize();
    }



    /**
     * 활성화된 시간주기 실행조건 워크플로우 목록을 갱신
     * (워크플로우 목록의 활성화를 체크하여, 워크플로우 실행 요청 Job을 등록하는 테스크)
     */
    @Scheduled(cron = "0/1 * * * * *")
    public void updateActivePeriodWorkflowList(){

        //  활성화된 시간주기 실행조건 워크플로우 목록을 조회
        List<ExecCondType> execCondTypeList = new ArrayList<ExecCondType>();
        execCondTypeList.add(ExecCondType.PERIOD_DAY_TIME);
        execCondTypeList.add(ExecCondType.PERIOD_CRON);
        List<Workflow> workflowList = workflowRepository.findByActFlagAndExecCondTypeIn(Flag.Y, execCondTypeList);

        //  활성화된 시간주기 실행조건 워크플로우 ID 목록 생성
        Vector<Long> activeWorkflowIdList = new Vector<Long>();
        for (Workflow workflow: workflowList){
            //  활성화된 워크플로우 ID 담기
            if (Flag.Y.equals(workflow.getActFlag())){
                activeWorkflowIdList.add(workflow.getId());
            }
        }


        //  현 활성화된 워크플로우 목록에 존재하지 않는 Job 스케줄 제거
        for (Long workflowId : workflowExecScheduleMap.keySet()){
            ScheduledFuture scheduledFuture = workflowExecScheduleMap.get(workflowId);
            if (!activeWorkflowIdList.contains(workflowId)){
                if (scheduledFuture.cancel(false)){
                    workflowExecScheduleMap.remove(workflowId);
                    log.debug("워크플로우 스케줄 비활성화(워크플로우 ID: "+ workflowId+")");
                }
            }
        }



        //  활성화된 워크플로우를 워크플로우 실행 스케줄로 등록
        for (Workflow workflow : workflowList){

            if (!workflowExecScheduleMap.containsKey(workflow.getId())){
                //  활성화된 워크플로우가 워크플로우 실행 스케줄로 존재하지 않는 경우,
                //  워크플로우 실행 스케줄 생성


                //  워크플로우 실행 Trigger 생성
                String cronExp = workflow.getExecCondCronExp();
                if (ExecCondType.PERIOD_DAY_TIME.equals(workflow.getExecCondType())){
                    //  크론식 생성
                    cronExp = createCronExp(workflow.getExecCondDayList(), workflow.getExecCondHour(), workflow.getExecCondMin());
                }
//                Trigger trigger = new CronTrigger(cronExp);
//                Trigger trigger = new CronTrigger(cronExp);

                log.info("워크플로우 스케줄 활성화(워크플로우 ID: "+workflow.getId()+" ,크론식: "+ cronExp +" )" );

                //  워크플로우 실행 요청 스케줄 등록
                ScheduledFuture<?> scheduledFuture =
//                        scheduler.schedule(new WorkflowExecJob(workflow.getId(), workflow.getName()), trigger);
                        taskScheduler.schedule(new WorkflowExecJob(workflow.getId(), workflow.getName()), new CronTrigger(cronExp, TimeZone.getTimeZone(TimeZone.getDefault().getID())));

                //  워크플로우 실행 요청 스케줄 맵 등록
                workflowExecScheduleMap.put(workflow.getId(), scheduledFuture);

                //  워크플로우 갱신 일시 갱신
                prevWorkflowUpdateDateTimeMap.put(workflow.getId(), workflow.getUpdateDateTime());

            }else{
                //  활성화된 워크플로우가 워크플로우 실행 스케줄로 존재하는 경우,
                //  기존 워크플로우 실행 스케줄 갱신


                LocalDateTime prevUpdateDateTime = prevWorkflowUpdateDateTimeMap.get(workflow.getId());

                if (!prevUpdateDateTime.equals(workflow.getUpdateDateTime())){
                    //  기존 워크플로우 갱신일시가 일치하지 않는경우,  스케줄 새로 재설정

                    ScheduledFuture scheduledFuture = workflowExecScheduleMap.get(workflow.getId());


                    //  기존 워크플로우 실행 스케줄 삭제 완료된 경우, 신규 스케줄 등록
                    if (scheduledFuture.cancel(false)){

                        //  기존 스케줄 제거
                        workflowExecScheduleMap.remove(workflow.getId());

                        // 워크플로우 실행 Trigger 생성
                        // 실행조건이 [cron 형식]이면 cronExp로 바로 넘어오고
                        // 실행조건이 [요일 및 시각]이면 cronExp를 재생성 하는 형태로 만듦
                        // 만든 실행조건에 일치하는 시간이 되면 scheduler를 이용해서 실행
                        /*
                        TODO: 2024.05.29 cron 형식으로 입력 받을때, cron 표현 필드가 6개뿐이라서, 7개 필드 입력값을 받지 못한다.
                         7번째 필드 연도를 입력 받기 위해 CronTrigger를 대신하여 다른 방식으로 trigger에 값을 등록해야 한다.
                         필드가 7개일때 trigger를 사용할 수 있는지 여부도 확인되어야 한다.
                         */

                        String cronExp = workflow.getExecCondCronExp();
                        if (ExecCondType.PERIOD_DAY_TIME.equals(workflow.getExecCondType())){
                            // [요일 및 시각] 입력 내용을 크론 형태로 변경
                            cronExp = createCronExp(workflow.getExecCondDayList(), workflow.getExecCondHour(), workflow.getExecCondMin());
                        }
//                        Trigger trigger = new CronTrigger(cronExp);
//                        org.quartz.CronTrigger trigger = TriggerBuilder.newTrigger()
//                                .withSchedule(CronScheduleBuilder.cronSchedule(cronExp))
//                                .build();
                        log.info("워크플로우 스케줄 활성화(워크플로우 ID: "+workflow.getId()+" ,크론식: "+ cronExp +" )" );


                        //  워크플로우 실행 요청 스케줄 등록
//                        scheduledFuture =
//                                scheduler.schedule(new WorkflowExecJob(workflow.getId(), workflow.getName()), trigger);
                        scheduledFuture =
                                taskScheduler.schedule(new WorkflowExecJob(workflow.getId(), workflow.getName()), new CronTrigger(cronExp, TimeZone.getTimeZone(TimeZone.getDefault().getID())));




                        //  워크플로우 실행 요청 스케줄 맵 등록
                        workflowExecScheduleMap.put(workflow.getId(), scheduledFuture);

                        //  워크플로우 갱신 일시 갱신
                        prevWorkflowUpdateDateTimeMap.put(workflow.getId(), workflow.getUpdateDateTime());
                    }

                }


            }
        }

    }




    /**
     * 크론식 생성
     *
     * @param condDayList   요일 목록
     * @param condHour  시간
     * @param condMin   분
     * @return 초 분 시 일 월 요일 연도
     */
    public String createCronExp(List<DayOfWeek> condDayList, Integer condHour, Integer condMin){
//        StringBuffer cronExp = new StringBuffer();
        StringBuilder cronExp = new StringBuilder();

        //  초
        cronExp.append(" ");
        cronExp.append("0");
        cronExp.append(" ");
        //  분
        cronExp.append(" ");
        if (condMin != null){
            cronExp.append(condMin);
        }else{
            cronExp.append("*");
        }
        cronExp.append(" ");
        //  시
        cronExp.append(" ");
        if (condHour != null){
            cronExp.append(condHour);
        }else{
            cronExp.append("*");
        }
        cronExp.append(" ");
        //  일
        cronExp.append(" ");
        cronExp.append("?");
        cronExp.append(" ");
        //  월
        cronExp.append(" ");
        cronExp.append("*");
        cronExp.append(" ");
        //  요일
        cronExp.append(" ");
        if (!condDayList.isEmpty()){
            List<String> dayList = new ArrayList<String>();
            for (DayOfWeek day : condDayList){
                if (DayOfWeek.SUNDAY.equals(day)) {
                    dayList.add("0");
                }else if (DayOfWeek.MONDAY.equals(day)){
                    dayList.add("1");
                }else if (DayOfWeek.TUESDAY.equals(day)){
                    dayList.add("2");
                }else if (DayOfWeek.WEDNESDAY.equals(day)){
                    dayList.add("3");
                }else if (DayOfWeek.THURSDAY.equals(day)){
                    dayList.add("4");
                }else if (DayOfWeek.FRIDAY.equals(day)){
                    dayList.add("5");
                }else if (DayOfWeek.SATURDAY.equals(day)){
                    dayList.add("6");
                }
            }
            String daysOfWeek = String.join(",", dayList);
            cronExp.append(daysOfWeek);
        }else{
            cronExp.append("?");
        }
        cronExp.append(" ");

        return cronExp.toString();
    }


    /**
     * 워크플로우 실행 Job을 모델링한 클래스
     */
    public class WorkflowExecJob implements Runnable {
        /**
         *  실행할 워크플로우의 ID
         */
        Long workflowId;

        /**
         * 실행할 워크플로우 이름
         */
        String workflowName;



        public WorkflowExecJob(Long workflowId, String workflowName) {
            this.workflowId = workflowId;
            this.workflowName = workflowName;
        }


        @Transactional
        @Override
        public void run() {

            workflowExecManager.requestWorkflowRun(this.workflowId,
                    WorkflowExecCause.TIME_PERIOD);

        }
    }
}
