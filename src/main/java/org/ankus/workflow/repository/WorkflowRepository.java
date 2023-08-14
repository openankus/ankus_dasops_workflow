package org.ankus.workflow.repository;

import org.ankus.workflow.model.ExecCondType;
import org.ankus.workflow.model.Flag;
import org.ankus.workflow.model.Workflow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowRepository extends JpaRepository<Workflow, Long> {

    /**
     * 일부 이름을 포함하는 워크플로우명의  워크플로우 목록을 반환
     * @param subName 일부 이름
     * @param pageable 페이지 요청 정보
     * @return
     */
    Page<Workflow> findByNameContaining(String subName, Pageable pageable);

    /**
     * 활성화되어 있으며, 원하는 실행조건 유형 목록에 해당하는 워크플로우 목록을 반환
     *
     * @param actFlag 워크플로우 활성화 여부
     * @param execCondTypeList 가능한 워크플로우 실행조건 유형
     * @return
     */
    List<Workflow> findByActFlagAndExecCondTypeIn(Flag actFlag, List<ExecCondType> execCondTypeList);

    Workflow findById(long id);

}
