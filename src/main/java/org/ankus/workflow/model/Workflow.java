package org.ankus.workflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.io.Serializable;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 워크플로우를 모델링한 클래스
 */
@Getter
@Setter
@Entity
public class Workflow implements Serializable {
    public Workflow(){

    }
//    public Workflow(Long id,String name,Flag actFlag,ExecCondType execCondType,Integer execCondHour,Integer execCondMin,String execCondCronExp,String createUser){
//        this.id = id;
//        this.name = name;
//        this.actFlag = actFlag;
//        this.execCondType = execCondType;
//        this.execCondHour = execCondHour;
//        this.execCondMin = execCondMin;
//        this.execCondCronExp = execCondCronExp;
//        this.createUser = createUser;
//    }



    /**
     * 워크플로우 ID
     */
    @Id @GeneratedValue
    Long id;

    /**
     * 이름
     */
    String name;

    /**
     * 활성여부
     */
    @Enumerated(EnumType.STRING)
    Flag actFlag;

    /**
     * 실행조건 유형
     */
    @Enumerated(EnumType.STRING)
    ExecCondType execCondType;

    /**
     * 실행조건의 요일목록(실행조건 유형:시간주기_요일_시간)
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "exec_cond_day", joinColumns = @JoinColumn(name = "workflow_id"))
    @Column(name = "day")
    List<DayOfWeek> execCondDayList = new ArrayList<DayOfWeek>();

    /**
     * 실행조건의 시(hour)(실행조건 유형:시간주기_요일_시간)
     */
    Integer execCondHour;

    /**
     * 실행조건의 분(Min)(실행조건 유형:시간주기_요일_시간)
     */
    Integer execCondMin;

    /**
     * 실행조건의 크론식(실행조건 유형:시간주기_크론식)
     */
    String execCondCronExp;

    /**
     * 실행조건의 이벤트 청취(실행조건 유형:이벤트 이름)
     */
    String execCondEventName;

    /**
     * 등록자
     */
    String createUser;

    /**
     * 워크플로우 단계 목록
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "workflow_id")
    List<WorkflowStep> workflowStepList = new ArrayList<WorkflowStep>();


    /**
     * 생성 일시
     */
    @CreationTimestamp
    LocalDateTime createDateTime;


    /**
     * 갱신 일시
     */
    @UpdateTimestamp
    LocalDateTime updateDateTime;



    /**
     * 워크플로우 실행이력 목록
     */
    @JsonIgnore
    @OneToMany(mappedBy = "workflow", orphanRemoval = true)
    List<WorkflowExecHist> workflowExecHistList = new ArrayList<WorkflowExecHist>();

    /**
     * workflow list에서 즉시 시작(Y) 또는 정지(N)에 해당하는 값 넣기위한 변수
     */
    @Transient      // 컬럼에서 제외하는 어노테이션
    String run;
}