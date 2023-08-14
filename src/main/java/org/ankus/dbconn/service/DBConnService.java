package org.ankus.dbconn.service;

import lombok.extern.slf4j.Slf4j;
import org.ankus.dbconn.model.DbConnect;
import org.ankus.dbconn.repository.DBConnRepository;
import org.ankus.dbconn.repository.DBConnRepositorySupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class DBConnService {
    @Autowired
    private DBConnRepository db_conn_repository;    // db_conn 테이블 연결

    @Autowired
    private DBConnRepositorySupport dbConnRepositorySupport;


    // db_conn 테이블에 데이터 입력
    public long save(DbConnect dbConnect){
        return db_conn_repository.save(dbConnect).getId();
    }

    public DbConnect findByid(int id){
        return db_conn_repository.findById(id);
    }

    //  id 값으로 정보 가져오기
    public DbConnect dbconn_name_search(String name){
        return db_conn_repository.findByName(name);
    }

    //  name 값으로 단일 정보 가져오기
    public DbConnect findByName(String name){
        return db_conn_repository.findByName(name);
    }

    public List<DbConnect> list(){
        return dbConnRepositorySupport.list();
    }

    // id값을 받아와 삭제
    public Integer delete(String name) {
        db_conn_repository.deleteByName(name);
        return db_conn_repository.countByName(name);
    }

    public long findByUseridAndPassword(String userid,String password) {
        return dbConnRepositorySupport.useridandpassword(userid, password);
    }
}
