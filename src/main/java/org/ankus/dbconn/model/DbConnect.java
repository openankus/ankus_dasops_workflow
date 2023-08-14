package org.ankus.dbconn.model;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@DynamicUpdate
public class DbConnect {
    public DbConnect() {

    }

    public DbConnect(String name, String dbname, int port, String url,String type){
        this.name=name;
        this.dbname = dbname;
        this.port = port;
        this.url = url;
        this.type = type;
    }

    @Id
    @GeneratedValue
    private int id;

    private String name;

    private String type;

    private String url;

    private int port;

    private String userid;

    private String password;

    private String dbname;

    @CreationTimestamp
    private LocalDateTime cdate;

    @UpdateTimestamp
    private LocalDateTime udate;

    private LocalDateTime ddate;

    private String createUser;


}
