package org.ankus;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.sql.DataSource;

/**
 * Spring Security 설정정보를 정의한 클래스
 */
@EnableWebSecurity
@AllArgsConstructor
public class SecurityConfiguration {
    @Autowired
    @Qualifier("dataSource")
    private DataSource dataSource;

    // Spring Security 인증을 위한 사용자 정보를 제공하는 서비스 객체
    private final UserDetailsService userDetailsService;

    @Bean
    public PersistentTokenRepository persistentTokenRepository() {
        JdbcTokenRepositoryImpl repo = new JdbcTokenRepositoryImpl();
        repo.setDataSource(dataSource);
        return repo;
    }

    /**
     * 패스워드 암호화용 인코더 Spring Bean 생성 메서드
     *
     * @return
     */
    @Bean
    public static BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS 허용 적용
    @Bean
    public static CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        //configuration.addAllowedOrigin("*");
        configuration.addAllowedOriginPattern("*");
        //configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * 보안처리를 위한 필터체인 설정
     *
     * @param http
     * @return
     * @throws Exception
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .antMatchers("/", "/join/**", "/login/**", "/common/**", "/share-code/**", "/eventListener/**").permitAll() // 설정한 리소스의 접근을 인증절차 없이 허용
                .antMatchers("/admin/*","/admin").hasRole("관리자") // '관리자' 역할을 가지고 있어야 접근 허용
                .anyRequest().authenticated() // 그 외 모든 리소스를 의미하며 인증 필요
                .and()
                .csrf().disable()
                .formLogin()
                .loginPage("/") // 기본 로그인 페이지
                .permitAll()
                .defaultSuccessUrl("/workflow_list") // 성공시 워크플로우 목록
                .and()
                .logout()
                // .logoutUrl("/logout") // 로그아웃 URL (기본 값 : /logout)
                // .logoutSuccessUrl("/login?logout") // 로그아웃 성공 URL (기본 값 : "/login?logout")
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout")) // 주소창에 요청해도 포스트로 인식하여 로그아웃
                .deleteCookies("JSESSIONID") // 로그아웃 시 JSESSIONID 제거
                .invalidateHttpSession(true) // 로그아웃 시 세션 종료
                .clearAuthentication(true) // 로그아웃 시 권한 제거
                .logoutSuccessUrl("/") // 로그아웃 성공시, 로그아웃 홈페이지로
                .and()
                .rememberMe()
                .rememberMeParameter("remember-me")
                .tokenRepository(persistentTokenRepository())
                .tokenValiditySeconds(2419200)
                .userDetailsService(userDetailsService)
                .and()
                .exceptionHandling()
                .accessDeniedPage("/accessDenied") // 접근 거부 발생시, 경고 페이지로 이동

        ;

        return http.build();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        // 사용자 인증을 위한 패스워드 암호화 인코더 설정
        auth.userDetailsService(userDetailsService).passwordEncoder(bCryptPasswordEncoder());
    }
}