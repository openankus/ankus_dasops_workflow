package org.ankus.workflow.repository;

import org.ankus.workflow.model.ModuleExecConf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuleExecConfRepsitory extends JpaRepository<ModuleExecConf, Long> {

    List<ModuleExecConf> findByNum(Integer num);
}
