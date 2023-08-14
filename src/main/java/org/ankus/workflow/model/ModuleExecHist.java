package org.ankus.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 모듈파일 실행이력을 모델링한 클래스
 */
@Getter
@Setter
@Entity
public class ModuleExecHist {
    /**
     * ID
     */
    @Id @GeneratedValue
    Long id;

    /**
     * 워크플로우 단계 실행이력 ID
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "workflow_step_exec_hist_id")
    @JsonIgnore
    WorkflowStepExecHist workflowStepExecHist;


    /**
     * 워크플로우 내 실행설정을 구분하는 번호
     */
    Integer num;

    /**
     * 실행설정 이름
     */
    String name;


    /**
     * 실행시 명령어 줄
     */
    @Column(columnDefinition = "TEXT")
    String cmdLine;


    /**
     * 워크플로우 실행 상태
     */
    @Enumerated(EnumType.STRING)
    ExecStat execStat;


    /**
     * 시작 일시
     */
    LocalDateTime startDateTime;


    /**
     * 종료 일시
     */
    LocalDateTime endDateTime;


    /**
     * 콘솔출력 파일경로
     */
    String conOutFilePath;


    /**
     * 에러 메시지
     */
    String errMsg;



}
