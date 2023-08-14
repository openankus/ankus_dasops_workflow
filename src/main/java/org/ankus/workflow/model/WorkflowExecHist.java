package org.ankus.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


/**
 * 워크플로우의 한 실행이력 모델링한 클래스
 */
@Getter
@Setter
@Entity
public class WorkflowExecHist {
    public WorkflowExecHist() {

    }
    public WorkflowExecHist(Long id,ExecStat execStat, LocalDateTime startDateTime,LocalDateTime endDateTime) {
        this.id=id;
        this.endDateTime=endDateTime;
        this.execStat=execStat;
        this.startDateTime=startDateTime;
    }

    /**
     * ID
     */
    @Id @GeneratedValue
    Long id;

    /**
     * 워크플로우
     */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "workflow_id")
    Workflow workflow;

    /**
     * 실행당시의 워크플로우 설정정보 JSon 문자열
     */
    @Column(columnDefinition = "TEXT")
    String runtimeConfJson;

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

    @JsonIgnore
    @OneToMany(mappedBy = "workflowExecHist", orphanRemoval = true)
    List<WorkflowStepExecHist> workflowStepExecHistList = new ArrayList<WorkflowStepExecHist>();



}
