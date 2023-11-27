package org.ankus.workflow.repository;

import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.ankus.workflow.model.QWorkflow;
import org.ankus.workflow.model.QWorkflowExecHist;
import org.ankus.workflow.model.Workflow;
import org.ankus.workflow.model.WorkflowExecHist;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class WorkflowExecHistRepositorySupport extends QuerydslRepositorySupport{

    private final JPAQueryFactory jpaQueryFactory;

    /**
     * Creates a new {@link QuerydslRepositorySupport} instance for the given domain type.
     * @param jpaQueryFactory
     */
    public WorkflowExecHistRepositorySupport(JPAQueryFactory jpaQueryFactory){
        super(WorkflowExecHist.class);
        this.jpaQueryFactory = jpaQueryFactory;
    }

    /**
     * 가장 최근의 워크플로우 실행이력을 반환
     *
     * @param workflowId 실행이력을 조회할 워크플로우의 ID
     * @param limit 워프플로우 이력 개수
     * @return
     */
    public List<WorkflowExecHist> getRecentWorkflowExecHistList(Long workflowId, Long limit){
//        List<WorkflowExecHist> workflowExecHistList =
//                jpaQueryFactory.selectFrom(QWorkflowExecHist.workflowExecHist)
//                        .where(QWorkflowExecHist.workflowExecHist.id.eq(
//                                JPAExpressions.select(QWorkflowExecHist.workflowExecHist.id.max())
//                                        .from(QWorkflowExecHist.workflowExecHist)
//                                        .where(QWorkflow.workflow.id.eq(workflowId)))).fetch();
        List<WorkflowExecHist> workflowExecHistList =
                jpaQueryFactory.selectFrom(QWorkflowExecHist.workflowExecHist)
                        .where(QWorkflowExecHist.workflowExecHist.workflow.id.eq(workflowId))
                        .orderBy(QWorkflowExecHist.workflowExecHist.startDateTime.desc())
                        .limit(limit)
                        .fetch();

        return workflowExecHistList;
    }


}
