package org.ankus.workflow.controller;

import lombok.extern.slf4j.Slf4j;
import org.ankus.workflow.service.WorkflowExecManager;
import org.ankus.workflow.service.WorkflowSvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * 이벤트 청취 REST API를 구현한 클래스
 */
@Slf4j
@Controller
@RequestMapping(value = "/eventListener")
public class EventListenApiController {

    /**
     *  워크플로우 실행을 관리하는 객체
     */
    @Autowired
    WorkflowExecManager workflowExecManager;


    /**
     * 워크플로우 서비스 객체
     */
    @Autowired
    private WorkflowSvc workflowSvc;



    /**
     * 이벤트를 기반으로 워크플로우 실행을 요청하는 API
     *
     * @param eventName 실행조건 이벤트 이름
     * @return 등록일자
     */
    @RequestMapping(value = "/inform")
    @ResponseBody
    public void informEvent(@RequestParam(required = true) String eventName, HttpServletRequest request){

        // 요청에 대한 IP 가져오기
        String remoteIp = request.getHeader("X-Forwarded-For");
        log.debug("X-FORWARDED-FOR : " + remoteIp);
        if (remoteIp == null) {
            remoteIp = request.getHeader("Proxy-Client-IP");
            log.debug("Proxy-Client-IP : " + remoteIp);
        }
        if (remoteIp == null) {
            remoteIp = request.getHeader("WL-Proxy-Client-IP");
            log.debug("WL-Proxy-Client-IP : " + remoteIp);
        }
        if (remoteIp == null) {
            remoteIp = request.getHeader("HTTP_CLIENT_IP");
            log.debug("HTTP_CLIENT_IP : " + remoteIp);
        }
        if (remoteIp == null) {
            remoteIp = request.getHeader("HTTP_X_FORWARDED_FOR");
            log.debug("HTTP_X_FORWARDED_FOR : " + remoteIp);
        }
        if (remoteIp == null) {
            remoteIp = request.getRemoteAddr();
            log.debug("getRemoteAddr : "+remoteIp);
        }
        log.debug("Result : IP Address : "+remoteIp);

        //  현재 시스템의 IP 가져오기
        InetAddress local = null;
        try {
            local = InetAddress.getLocalHost();
        }catch ( UnknownHostException e ) {
            e.printStackTrace();
        }
        String localIp = "";
        if( local != null ){
            localIp = local.getHostAddress();
        }

        // 실행상태 이벤트 기반 워크플로우 실행 요청
        // 아무나 접속 못하게 IP 제한
        if ("127.0.0.1".equals(remoteIp.trim()) || "0:0:0:0:0:0:0:1".equals(remoteIp.trim()) || localIp.equals(remoteIp.trim())){
            //  시스템 내부 요청 만을 수용하여, 워크플로우 실행 처리
            log.info("실행상태 이벤트 기반 워크플로우 실행 요청(이벤트명:"+eventName+")");
            workflowSvc.requestEventListenWorkflowExec(eventName);
        }

    }

}
