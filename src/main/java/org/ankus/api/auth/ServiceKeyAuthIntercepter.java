package org.ankus.api.auth;

import lombok.extern.slf4j.Slf4j;
import org.ankus.model.ServiceKeyInfo;
import org.ankus.service.ServiceKeyInfoSvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequestInterceptor;
import org.springframework.web.servlet.handler.WebRequestHandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.AccessDeniedException;

/**
 * API 인증을 위한 인터셉터
 */
@Slf4j
@Component
public class ServiceKeyAuthIntercepter extends WebRequestHandlerInterceptorAdapter {

    @Autowired
    ServiceKeyInfoSvc serviceKeyInfoSvc;



    /**
     * Create a new WebRequestHandlerInterceptorAdapter for the given WebRequestInterceptor.
     *
     * @param requestInterceptor the WebRequestInterceptor to wrap
     */
    public ServiceKeyAuthIntercepter(WebRequestInterceptor requestInterceptor) {
        super(requestInterceptor);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // API 관련 URL 주소에 대한 서비스키를 확인 및 인증
        if (request.getRequestURI().indexOf("/api") == 0){


            String remoteIp = request.getHeader("X-Forwarded-For");
            if (remoteIp == null) {
                remoteIp = request.getHeader("Proxy-Client-IP");
            }
            if (remoteIp == null) {
                remoteIp = request.getHeader("WL-Proxy-Client-IP");
            }
            if (remoteIp == null) {
                remoteIp = request.getHeader("HTTP_CLIENT_IP");
            }
            if (remoteIp == null) {
                remoteIp = request.getHeader("HTTP_X_FORWARDED_FOR");
            }
            if (remoteIp == null) {
                remoteIp = request.getRemoteAddr();
            }
            //  현재 시스템의 IP 가져오기
            InetAddress local = null;
            try {
                local = InetAddress.getLocalHost();
            }catch (UnknownHostException e ) {
                e.printStackTrace();
            }
            String localIp = "";
            if( local != null ){
                localIp = local.getHostAddress();
            }

            // 아무나 API 접근 못하도록 접근 제한
            if ("127.0.0.1".equals(remoteIp.trim()) || "0:0:0:0:0:0:0:1".equals(remoteIp.trim()) || localIp.equals(remoteIp.trim())){
                // 로컬IP 확인을 통한 접근 제한(즉, 동일서버내에 구동되는 프로그램만 무제한 접근 가능)
                log.info("동일서버내 API 접근(요청 URL: "+request.getRequestURL()+")");
            }else{
                // 서비스 key 인증으로 접근제한
                String serviceKey = request.getParameter("serviceKey");
                if (serviceKey == null){
                    throw new AccessDeniedException("The serviceKey parameter does not exist.");
                }else if (!serviceKeyInfoSvc.isValidServiceKey(serviceKey)){
                    throw new AccessDeniedException("The serviceKey parameter is not authenticated.");
                }
            }
        }
        return super.preHandle(request, response, handler);
    }
}
