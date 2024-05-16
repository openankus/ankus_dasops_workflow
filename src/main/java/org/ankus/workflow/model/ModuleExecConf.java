package org.ankus.workflow.model;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * 모듈파일 실행설정을 모델링한 클래스
 */
@Getter
@Setter
@Entity
public class ModuleExecConf implements Serializable {

    /**
     * ID
     */
    @Id @GeneratedValue
    Long id;

    /**
     * 워크플로우 내 실행설정을 구분하는 번호
     */
    Integer num;

    /**
     * 실행설정 이름
     */
    String name;

    /**
     * 실행파일 경로
     */
    String moduleFilePath;

    /**
     * 명령어 인자 목록
     */
    @ElementCollection
    @CollectionTable(name = "cmd_arg", joinColumns = @JoinColumn(name = "module_exec_conf_id"))
    @Column(name = "arg")
    List<String> cmdArgList = new ArrayList<String>();
}