package org.ankus.workflow.model;

/**
 * 실행 상태를 정의한 나열형
 */
public enum ExecStat {

    /**
     * 실행이 되지 않음
     */
    NOT_STARTED,
    /**
     * 진행 중
     */
    RUNNING,
    /**
     * 중지 중
     */
    STOPPING,
    /**
     * 중지
     */
    STOPPED,
    /**
     * 실패
     */
    FAILED,
    /**
     * 완료
     */
    COMPLETE
}
