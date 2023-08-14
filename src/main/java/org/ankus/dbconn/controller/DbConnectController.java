package org.ankus.dbconn.controller;

import lombok.extern.slf4j.Slf4j;
import org.ankus.dbconn.model.DbConnect;
import org.ankus.dbconn.service.DBConnService;
import org.ankus.dbconn.service.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

@Slf4j
@Controller
public class DbConnectController {
    @Autowired
    private DBConnService dbConnService;

    //  DB 연결정보 목록페이지
    @RequestMapping(value="dblist")
    public String dblist(){
        return "db/dblist";
    }

    //  DB 연결정보 등록페이지 저장클릭시 동작하는 메소드
    @RequestMapping(value="dbSave",method= RequestMethod.POST)
    @ResponseBody
    public long dbInsert(DbConnect db_connect){
        return dbConnService.save(db_connect);
    }

    //  DB 연결정보 수정페이지
    @RequestMapping(value="dbInformation", method=RequestMethod.POST)
    @ResponseBody
    public DbConnect db_conn_update(@RequestParam String name){
        return dbConnService.findByName(name);
    }

    //  DB 연결정보 등록페이지 연결정보 명 중복 확인 하는 메소드
    @RequestMapping(value="dbconn_name_search", method= RequestMethod.POST)
    @ResponseBody
    public String db_conn_insert_name(@RequestParam String name){

        DbConnect dbConnect = dbConnService.dbconn_name_search(name);
        return String.valueOf(dbConnect==null?"":dbConnect.getId());
    }

    //  DB 연결정보 열람페이지 삭제 버튼 클릭시 동작하는 메소드
    @RequestMapping(value="dbconn_delete", method = RequestMethod.POST)
    @ResponseBody
    public Integer dbconnDelete(@RequestParam String name){
        return dbConnService.delete(name);
    }

    @RequestMapping(value="findByNameLike", method= RequestMethod.POST)
    @ResponseBody
    public DbConnect findByNameLike(@RequestParam String name){
        return dbConnService.findByName(name);
    }

    @RequestMapping(value="dbSelct")
    @ResponseBody
    public List<DbConnect> dbSelect(){
        return dbConnService.list();
    }


    @RequestMapping(value="query_result", method= RequestMethod.POST)
    @ResponseBody
    public List<Map> queryResult(@RequestParam String sql, String name, @RequestParam int startRow, @RequestParam int rowCount){
        Query query = new Query(dbConnService.findByName(name));
        List<Map> result = query.select(sql,startRow,rowCount);
        return result;
    }

    @RequestMapping(value="csv_download", method= RequestMethod.POST)
    public ResponseEntity<byte[]> queryResult(@RequestParam String sql, @RequestParam String name, HttpServletResponse response){
        System.out.println(sql);
        System.out.println(name);
        Query query = new Query(dbConnService.findByName(name));
        ResponseEntity<byte[]> result = query.csvDownload(name,sql,response);


        return result;
    }

    @RequestMapping(value="schemasList",method = RequestMethod.POST)
    @ResponseBody
    public List<Map> schemasList(@RequestParam(value="name") String name){
        Query query = new Query(dbConnService.findByName(name));
        return query.schemasList();
    }
    @RequestMapping(value="tableList",method = RequestMethod.POST)
    @ResponseBody
    public List<String> schemasList(@RequestParam(value="name") String name,@RequestParam(value="catalog" ,required = false) String catalog,@RequestParam(value = "schema" ,required = false) String schema){
        Query query = new Query(dbConnService.findByName(name));
        return query.tableList(catalog,schema);
    }
    @RequestMapping(value="columnList",method = RequestMethod.POST)
    @ResponseBody
    public Map columnList(@RequestParam(value="name") String name,@RequestParam(value="catalog" ,required = false) String catalog,@RequestParam(value = "schema" ,required = false) String schema,@RequestParam(value = "table") String table){
        Query query = new Query(dbConnService.findByName(name));
        return query.columnList(catalog, schema, table);
    }

    @RequestMapping(value="UseridPwCheck",method = RequestMethod.POST)
    @ResponseBody
    public long getUseridAndPassword(@RequestParam String userid, @RequestParam String password){
        return dbConnService.findByUseridAndPassword(userid,password);
    }

}
