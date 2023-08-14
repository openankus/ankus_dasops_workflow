package org.ankus.workflow.model;

/**
 * 워크플로우 실행 원인을 정의한 나열형
 */
public enum WorkflowExecCause {
    /**
     * 온디맨드 실행요청
     */
    ON_DEMAND,
    
    /**
     * 시간주기
     */
    TIME_PERIOD,
    
    /**
     * 이벤트 청취
     */
    EVENT_LISTEN
}
