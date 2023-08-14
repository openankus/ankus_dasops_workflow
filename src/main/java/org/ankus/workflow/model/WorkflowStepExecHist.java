package org.ankus.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * 워크플로우를 구성하는 단계를 모델링한 클래스
 */
@Getter
@Setter
@Entity
public class WorkflowStepExecHist {

    /**
     * 식별자
     */
    @Id @GeneratedValue
    Long id;


    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "workflow_exec_hist_id")
    WorkflowExecHist workflowExecHist;

    /**
     * 단계 번호
     */
    Integer num;

    /**
     * 워크플로우 단계 실행 상태
     */
    @Enumerated(EnumType.STRING)
    ExecStat execStat;



    /**
     * 모듈파일 실행이력 목록
     */
    @OneToMany(mappedBy = "workflowStepExecHist", orphanRemoval = true)
    @JsonIgnore
    List<ModuleExecHist> moduleExecHistList = new ArrayList<ModuleExecHist>();
}
