package org.ankus.workflow.repository;

import org.ankus.workflow.model.ExecStat;
import org.ankus.workflow.model.Workflow;
import org.ankus.workflow.model.WorkflowExecHist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkflowExecHistRespository extends JpaRepository<WorkflowExecHist, Long> {
    Page<WorkflowExecHist> findByWorkflowId(long id, Pageable pageable);

    long countByWorkflowId(long id);

    /**
     * 실행상태에 해당하는 워크플로우목 록 반환
     * 
     * @param execStat 실행상태
     * @return
     */
    List<WorkflowExecHist> findWorkflowExecHistsByExecStatEquals(ExecStat execStat);


    /**
     * 특정 종료시간 이전의 워크플로우 목록 반환
     *
     * @param endDateTime 실행상태
     * @return
     */
    List<WorkflowExecHist> findWorkflowExecHistsByEndDateTimeBefore(LocalDateTime endDateTime);


}
