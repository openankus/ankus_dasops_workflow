package org.ankus.api.auth;

import org.ankus.model.ServiceKeyInfo;
import org.ankus.service.ServiceKeyInfoSvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequestInterceptor;
import org.springframework.web.servlet.handler.WebRequestHandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.nio.file.AccessDeniedException;

/**
 * API 인증을 위한 인터셉터
 */
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
            String serviceKey = request.getParameter("serviceKey");
            if (serviceKey == null){
                throw new AccessDeniedException("The serviceKey parameter does not exist.");
            }else if (!serviceKeyInfoSvc.isValidServiceKey(serviceKey)){
                throw new AccessDeniedException("The serviceKey parameter is not authenticated.");
            }

        }


        return super.preHandle(request, response, handler);
    }
}
