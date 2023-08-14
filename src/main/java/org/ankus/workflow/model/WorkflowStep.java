package org.ankus.workflow.model;

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
public class WorkflowStep {

    /**
     * 식별자
     */
    @Id @GeneratedValue
    Long id;

    /**
     * 단계 번호
     */
    Integer num;



    /**
     * 모듈파일 실행설정 목록
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "workflow_step_id")
    List<ModuleExecConf> moduleExecConfList = new ArrayList<ModuleExecConf>();
}
