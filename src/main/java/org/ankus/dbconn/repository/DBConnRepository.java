package org.ankus.dbconn.repository;

import org.ankus.dbconn.model.DbConnect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface DBConnRepository extends JpaRepository<DbConnect, Integer>, JpaSpecificationExecutor<DbConnect> {

    @Query(value="select db_connect_id from ankus_advance.db_connect where name = ?1", nativeQuery = true)
    String db_conn_name_search(String name);


    DbConnect findById(int id);

    Integer countById(int id);

    DbConnect findByName(String name);

    List<DbConnect> findByDbnameLike(String name);

    @Transactional
    void deleteByName(String name);

    Integer countByName(String name);

}
