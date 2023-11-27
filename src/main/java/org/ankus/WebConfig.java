package org.ankus;

import lombok.RequiredArgsConstructor;
import org.ankus.api.auth.ServiceKeyAuthIntercepter;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@RequiredArgsConstructor
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    private final ServiceKeyAuthIntercepter serviceKeyAuthIntercepter;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        WebMvcConfigurer.super.addInterceptors(registry);
        
        // API 인증을 위한 인터셉터 추가
        registry.addInterceptor(serviceKeyAuthIntercepter);
    }
}
