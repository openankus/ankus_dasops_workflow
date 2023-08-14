package org.ankus.workflow.repository;

import org.ankus.workflow.model.WorkflowExecHist;
import org.ankus.workflow.model.WorkflowStepExecHist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowStepExecHistRepository extends JpaRepository<WorkflowStepExecHist, Long> {

    List<WorkflowExecHist> findByWorkflowExecHistId(long id);

    List<WorkflowExecHist> findByWorkflowExecHist(long id);
}
