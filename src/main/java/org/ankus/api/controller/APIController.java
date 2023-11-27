package org.ankus.api.controller;

import lombok.extern.slf4j.Slf4j;
import org.ankus.workflow.model.*;
import org.ankus.workflow.service.WorkflowSvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.*;

/**
 * Workflow 조회 및 제어 관련 API 기능을 정의한 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping(value = "/api")
public class APIController {

    @Autowired
    WorkflowSvc workflowSvc;

    /**
     * 이름이 부분적으로 일치하는 워크플로우 목록을 반환
     * 
     * @param subName 검색할 워크플로우 이름 일부
     * @return
     */
    @GetMapping("/listWorkflow")
    public LinkedHashMap<String, Object> listWorlflow(@RequestParam(defaultValue = "") String subName){

        // 반환용 워크플로우 정보 조회
        List<Workflow> workflows = workflowSvc.listWorkflows(subName);

        // 워크플로우 정보 목록 생성
        List<LinkedHashMap<String, Object>> valList = new ArrayList<LinkedHashMap<String, Object>>();
        for (Workflow workflow : workflows){
            LinkedHashMap<String, Object> val = new LinkedHashMap<String, Object>();
            val.put("workflowId", workflow.getId());
            val.put("workflowName", workflow.getName());
            val.put("actFlag", workflow.getActFlag());
            val.put("updateDateTime", workflow.getUpdateDateTime());
            val.put("isRunning", workflowSvc.isRunningWorkflow(workflow.getId()));

            valList.add(val);
        }

        // 반환용 정보 생성
        LinkedHashMap<String, Object> retVal = new LinkedHashMap<String, Object>();
        retVal.put("resultStatus", "success");
        retVal.put("resultData", valList);

        return retVal;
    }

    /**
     * 특정 워크플로우의 최근 실행이력들을 반환
     *
     * @param workflowId 워크플로우 ID
     * @param limit 워크플로우 이력 개수
     * @return
     */
    @GetMapping("/getRecentWorkflowHistoryList")
    public LinkedHashMap<String, Object> getRecentWorkflowHistory(@RequestParam(required = true) Long workflowId,
                                                                  @RequestParam(required = false, defaultValue = "5") Long limit){
        List<WorkflowExecHist> workflowExecHistList = workflowSvc.getRecentWorkflowExecHistList(workflowId, limit);

        System.out.println(workflowExecHistList);

        List<LinkedHashMap<String, Object>> valList = new ArrayList<LinkedHashMap<String, Object>>();
        for (WorkflowExecHist workflowExecHist: workflowExecHistList){
            //---<워크플로우 실행이력 정보 생성>---

            LinkedHashMap<String, Object> val = new LinkedHashMap<String, Object>();
            val.put("workflowId", workflowExecHist.getWorkflow().getId());
            val.put("workflowName", workflowExecHist.getWorkflow().getName());
            val.put("workflowExecStat", workflowExecHist.getExecStat());
            val.put("workflowStartDateTime", workflowExecHist.getStartDateTime());
            val.put("workflowEndDateTime", workflowExecHist.getEndDateTime());
            //  워크플로우 스탭 이력 설정
            List<LinkedHashMap<String, Object>> stepList = new ArrayList<LinkedHashMap<String, Object>>();
            for (WorkflowStepExecHist workflowStepExecHist : workflowExecHist.getWorkflowStepExecHistList()){
                LinkedHashMap<String, Object> step = new LinkedHashMap<String, Object>();
                step.put("stepNum", workflowStepExecHist.getNum());
                step.put("stepExecStat", workflowStepExecHist.getExecStat());
                //  모듈 실행 이력 설정
                List<LinkedHashMap<String, Object>> execList = new ArrayList<LinkedHashMap<String, Object>>();
                for (ModuleExecHist moduleExecHist : workflowStepExecHist.getModuleExecHistList()){
                    LinkedHashMap<String, Object> exec = new LinkedHashMap<String, Object>();
                    exec.put("moduleExecHistId", moduleExecHist.getId());
                    exec.put("moduleExecName", moduleExecHist.getName());
                    exec.put("moduleExecHistStat", moduleExecHist.getExecStat());
                    exec.put("moduleExecHistStartDateTime", moduleExecHist.getStartDateTime());
                    exec.put("moduleExecHistEndDateTime", moduleExecHist.getEndDateTime());
                    execList.add(exec);
                }
                step.put("moduleExecHistList", execList);

                stepList.add(step);
            }
            val.put("stepExecHistList", stepList);
            //---</워크플로우 실행이력 정보 생성>---

            valList.add(val);
        }

        // 반환용 정보 생성
        LinkedHashMap<String, Object> retVal = new LinkedHashMap<String, Object>();
        retVal.put("resultStatus", "success");
        retVal.put("resultData", valList);

        return retVal;
    }


    /**
     * 특정 모듈실행 이력의 콘솔출력 문자열을 반환
     *
     * @param moduleExecHistId 모듈실행이력ID
     * @param lineCount 출력할 라인수
     * @return
     */
    @GetMapping("/getConOutText")
    public LinkedHashMap<String, Object> getConOutText(@RequestParam(required = true) Long moduleExecHistId,
                                                   @RequestParam(required = true, defaultValue = "10") Integer lineCount)
            throws FileNotFoundException, IOException{

        String conOutText = workflowSvc.getConOutText(moduleExecHistId, lineCount);

        LinkedHashMap<String, Object> val = new LinkedHashMap<String, Object>();
        val.put("moduleExecHistId",moduleExecHistId);
        val.put("lineCount",lineCount);
        val.put("conOutText",conOutText);


        // 반환용 정보 생성
        LinkedHashMap<String, Object> retVal = new LinkedHashMap<String, Object>();
        retVal.put("resultStatus", "success");
        retVal.put("resultData", val);

        return retVal;
    }

    /**
     * 워크플로우 실행을 요청
     *
     * @param workflowId
     * @return
     */
    @GetMapping("/requestWorkflowRun")
    public LinkedHashMap<String, Object> requestWorkflowRun(@RequestParam(required = true) Long workflowId){

        String workflowName = workflowSvc.workflowRun(workflowId, WorkflowExecCause.API_REQUEST);

        LinkedHashMap<String, Object> val = new LinkedHashMap<String, Object>();
        val.put("workflowId", workflowId);
        val.put("workflowName", workflowName);

        // 반환용 정보 생성
        LinkedHashMap<String, Object> retVal = new LinkedHashMap<String, Object>();
        retVal.put("resultStatus", "success");
        retVal.put("resultData", val);

        return retVal;
    }

    /**
     * 워크플로우 실행중지를 요청
     *
     * @param workflowId
     * @return
     */
    @GetMapping("/requestWorkflowStop")
    public LinkedHashMap<String, Object> requestWorkflowStop(@RequestParam(required = true) Long workflowId){

        workflowSvc.workflowOnDemandStop(workflowId);
        Workflow workflow = workflowSvc.getWorkflow(workflowId);

        LinkedHashMap<String, Object> val = new LinkedHashMap<String, Object>();
        val.put("workflowId", workflowId);
        val.put("workflowName", workflow.getName());

        // 반환용 정보 생성
        LinkedHashMap<String, Object> retVal = new LinkedHashMap<String, Object>();
        retVal.put("resultStatus", "success");
        retVal.put("resultData", val);

        return retVal;
    }

    /**
     * 실행중인 워크플로우 중지를 요청
     *
     * @return
     */
    @GetMapping("/listRunningWorkflow")
    public LinkedHashMap<String, Object> listRunningWorkflow(){
        Set<Long> runningWorkflowIdSet = workflowSvc.getAllRunningWorkflowIdSet();

        LinkedHashMap<String, Object> val = new LinkedHashMap<String, Object>();
        val.put("workflowIdList", runningWorkflowIdSet);

        // 반환용 정보 생성
        LinkedHashMap<String, Object> retVal = new LinkedHashMap<String, Object>();
        retVal.put("resultStatus", "success");
        retVal.put("resultData", val);

        return retVal;
    }




    /**
     * 워크플로우 실행을 위한 이벤트를 알려주는 API
     *
     * @param eventName 워크플로우 실행조건 이벤트 이름
     * @param request
     */
    @RequestMapping(value="/informEvent")
    public LinkedHashMap<String, Object> informEvent(@RequestParam(required = true) String eventName, HttpServletRequest request){

//        // 요청에 대한 IP 가져오기
//        String remoteIp = request.getHeader("X-Forwarded-For");
//        log.debug("X-FORWARDED-FOR : " + remoteIp);
//        if (remoteIp == null) {
//            remoteIp = request.getHeader("Proxy-Client-IP");
//            log.debug("Proxy-Client-IP : " + remoteIp);
//        }
//        if (remoteIp == null) {
//            remoteIp = request.getHeader("WL-Proxy-Client-IP");
//            log.debug("WL-Proxy-Client-IP : " + remoteIp);
//        }
//        if (remoteIp == null) {
//            remoteIp = request.getHeader("HTTP_CLIENT_IP");
//            log.debug("HTTP_CLIENT_IP : " + remoteIp);
//        }
//        if (remoteIp == null) {
//            remoteIp = request.getHeader("HTTP_X_FORWARDED_FOR");
//            log.debug("HTTP_X_FORWARDED_FOR : " + remoteIp);
//        }
//        if (remoteIp == null) {
//            remoteIp = request.getRemoteAddr();
//            log.debug("getRemoteAddr : "+remoteIp);
//        }
//        log.debug("Result : IP Address : "+remoteIp);
//
//        //  현재 시스템의 IP 가져오기
//        InetAddress local = null;
//        try {
//            local = InetAddress.getLocalHost();
//        }catch ( UnknownHostException e ) {
//            e.printStackTrace();
//        }
//        String localIp = "";
//        if( local != null ){
//            localIp = local.getHostAddress();
//        }
//
//        // 실행상태 이벤트 기반 워크플로우 실행 요청
//        // 아무나 접속 못하게 IP 제한
//        if ("127.0.0.1".equals(remoteIp.trim()) || "0:0:0:0:0:0:0:1".equals(remoteIp.trim()) || localIp.equals(remoteIp.trim())){
//            //  시스템 내부 요청 만을 수용하여, 워크플로우 실행 처리
//            log.info("실행상태 이벤트 기반 워크플로우 실행 요청(이벤트명:"+eventName+")");
//            workflowSvc.requestEventListenWorkflowExec(eventName);
//        }

        log.info("이벤트 기반 워크플로우 실행 요청(이벤트명:"+eventName+")");
        workflowSvc.requestEventListenWorkflowExec(eventName);

        // 반환용 정보 생성
        LinkedHashMap<String, Object> retVal = new LinkedHashMap<String, Object>();
        retVal.put("resultStatus", "success");

        return retVal;

    }
}
