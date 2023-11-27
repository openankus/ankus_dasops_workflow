package org.ankus.api.model;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import org.springframework.http.HttpStatus;

/**
 * 에러 응답을 모델링한 클래스
 */
@Getter
@ToString
public class ApiExceptionEntity {

    final private String resultStatus = "fail";
    private String errorCode;
    private String errorMessage;

    @Builder
    public ApiExceptionEntity(String errorCode, String errorMessage){
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }    
}
