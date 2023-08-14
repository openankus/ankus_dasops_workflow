package org.ankus.workflow.model;

/**
 * 실행조건 유형을 정의한 나열형
 */
public enum ExecCondType {
    /**
     * 시간주기_요일_시간
     */
    PERIOD_DAY_TIME,
    /**
     * 시간주기_크론식
     */
    PERIOD_CRON,
    /**
     * 이벤트 청취
     */
    EVENT_LISTEN
}
