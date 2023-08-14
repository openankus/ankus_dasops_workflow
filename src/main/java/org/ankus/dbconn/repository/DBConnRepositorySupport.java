package org.ankus.dbconn.repository;


import com.querydsl.core.QueryResults;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.ankus.dbconn.model.DbConnect;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.springframework.stereotype.Repository;

import java.util.List;

import static org.ankus.dbconn.model.QDbConnect.dbConnect;

@Repository
public class DBConnRepositorySupport extends QuerydslRepositorySupport {
    private final JPAQueryFactory jpaQueryFactory;

    public DBConnRepositorySupport(JPAQueryFactory jpaQueryFactory){
        super(DbConnect.class);
        this.jpaQueryFactory = jpaQueryFactory;
    }

    public List<DbConnect> list(){

        QueryResults<DbConnect> queryResult = jpaQueryFactory
                .select(Projections.constructor(DbConnect.class,
                                dbConnect.name,
                                dbConnect.dbname,
                                dbConnect.port,
                                dbConnect.url,
                                dbConnect.type))
                .from(dbConnect)
                .fetchResults();
        return queryResult.getResults();
    }

    public long useridandpassword(String userid,String password){
        return jpaQueryFactory.selectFrom(dbConnect)
                .where(
                        dbConnect.userid.eq(userid),
                        dbConnect.password.eq(password))
                .fetchCount();
    }
}
