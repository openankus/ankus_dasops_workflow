package org.ankus.dbconn.service;

    import org.ankus.dbconn.model.DbConnect;
    import org.apache.commons.csv.CSVFormat;
    import org.apache.commons.csv.CSVPrinter;
    import org.springframework.http.HttpHeaders;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.MediaType;
    import org.springframework.http.ResponseEntity;

    import javax.servlet.http.HttpServletResponse;
    import java.sql.*;
    import java.util.ArrayList;
    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;
    import java.io.*;


    // DB 데이터 조회페이지 동작을 위한 클래스
    public class Query {
        private String url;
        private String username;
        private String password;

        private String databaseName;

        private String type;

        // DB 데이터 조회페이지에 쿼리 실행시 DB연결정보 값을 토대로 연결하는 메소드
        public Query(DbConnect dbConnect){
            System.out.println("Db_select생성자 실행");
            try {
                System.out.println(dbConnect.getType());
    //            Class.forName("org.postgresql.Driver");
                if(dbConnect.getType().equals("PostgreSQL")) {
                    Class.forName("org."+ dbConnect.getType().toLowerCase()+".Driver");
                    url = "jdbc:" + dbConnect.getType().toLowerCase() + "://" + dbConnect.getUrl().toLowerCase() + ":" + dbConnect.getPort() + "/"+dbConnect.getDbname()+"?characterEncoding=UTF-8&serverTimezone=UTC";

                }else if(dbConnect.getType().equals("MariaDB")){
                    Class.forName("org."+ dbConnect.getType().toLowerCase()+".jdbc.Driver");
                    url = "jdbc:" + dbConnect.getType().toLowerCase() + "://" + dbConnect.getUrl().toLowerCase() + ":" + dbConnect.getPort() + "/"+dbConnect.getDbname();
                }else{
                    Class.forName("oracle.jdbc.driver."+ dbConnect.getType()+"Driver");
                    url = "jdbc:" + dbConnect.getType().toLowerCase() + ":thin:@" + dbConnect.getUrl().toLowerCase() + ":" + Integer.valueOf(dbConnect.getPort()) + ":XE";
                }
                username = dbConnect.getUserid();
                password = dbConnect.getPassword();
                databaseName = dbConnect.getDbname();
            }catch (ClassNotFoundException e){
                e.printStackTrace();
            }

        }

        public List<Map> schemasList(){
            List<Map> result = new ArrayList<>();
            Connection conn = null;
            ResultSet rs = null;
            PreparedStatement pstmt = null;
            System.out.println("schemas");
            try {
                conn = DriverManager.getConnection(url,username,password);
                rs = conn.getMetaData().getSchemas();
                while(rs.next()){
                    Map<String,String> arr = new HashMap<>();
                    arr.put("catalog",rs.getString("TABLE_CATALOG"));
                    arr.put("schema",rs.getString("TABLE_SCHEM"));
                    result.add(arr);
                }
            }catch (SQLException e){
                Map<String,String> arr = new HashMap<>();
                arr.put("err",e.toString());
                result.add(arr);
                return result;
            }finally {
                try{
                    if (rs != null && rs.isClosed()) {
                        rs.close();
                    }
                    if (conn != null && conn.isClosed()) {
                        conn.close();
                    }
                    if(pstmt != null && !pstmt.isClosed()){
                        pstmt.close();
                    }
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            return result;
        }
        public List<String> tableList(String catalog,String schema){
            List<String> result = new ArrayList<>();
            Connection conn = null;
            ResultSet rs = null;
            PreparedStatement pstmt = null;
            System.out.println("table");
            try {
                conn = DriverManager.getConnection(url,username,password);
                rs = conn.getMetaData().getTables(catalog,schema, null, new String[]{"TABLE"});
                while(rs.next()){
                    result.add(rs.getString("TABLE_NAME"));
                }
            }catch (SQLException e){
                result.add("err");
                result.add(e.toString());
                return result;
            }finally {
                try{
                    if (rs != null && rs.isClosed()) {
                        rs.close();
                    }
                    if (conn != null && conn.isClosed()) {
                        conn.close();
                    }
                    if(pstmt != null && !pstmt.isClosed()){
                        pstmt.close();
                        conn.close();
                    }
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            return result;
        }
        public Map columnList(String catalog,String schema,String table){
            Map<String,String> result = new HashMap<>();
            Connection conn = null;
            ResultSet rs = null;
            PreparedStatement pstmt = null;
            try {
                conn = DriverManager.getConnection(url,username,password);
                rs = conn.getMetaData().getColumns(catalog,schema,table,null);
                while(rs.next()){
                    result.put(rs.getString("COLUMN_NAME"), rs.getString("TYPE_NAME"));
                }
            }catch (SQLException e){
                result.put("err", e.toString());
                return result;
            }finally {
                try{
                    if (rs != null && rs.isClosed()) {
                        rs.close();
                    }
                    if (conn != null && conn.isClosed()) {
                        conn.close();
                    }
                    if(pstmt != null && !pstmt.isClosed()){
                        pstmt.close();
                        conn.close();
                    }
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }
            return result;
        }


        public List<Map> select(String sql,int startRow, int rowCount){
            List<Map> arr = new ArrayList<>();
            System.out.println("query 실행");
            Connection conn = null;
            ResultSet rs = null;
            PreparedStatement pstmt = null;

            try {
                conn = DriverManager.getConnection(url,username,password);
                sql = sql.replaceAll("\n"," ").replaceAll("\t"," ").replace(";","");
                System.out.println("쿼리문 : "+sql);
                String[] sql_split = sql.split(" ");
                String re_sql = "";
                if(sql_split.length>1) {
                    int x = 1;
                    while(true) {
                        if(sql_split[sql_split.length - (x)].equals("")){
                            x += 1;
                            continue;
                        }

                        if (sql_split[sql_split.length - (x+3)].equals("limit")) {
                            sql_split[sql_split.length - (x+2)] = String.valueOf(rowCount);
                        }
                        if (sql_split[sql_split.length - (x+1)].equals("limit")) {
                            sql_split[sql_split.length - x] = String.valueOf(rowCount);
                        }
                        if (sql_split[sql_split.length - (x+3)].equals("offset")) {
                            sql_split[sql_split.length - (x+2)] = String.valueOf(startRow);
                        }
                        if (sql_split[sql_split.length - (x+1)].equals("offset")) {
                            sql_split[sql_split.length - x] = String.valueOf(startRow);
                        }

                        // sql 최종 결과물 조합
                        for (int i = 0; i < sql_split.length; i++) {
                            re_sql += " " + sql_split[i];
                        }

                        // limit 또는 offset 없으면 추가
                        if (!sql_split[sql_split.length - (x+3)].equals("limit") && !sql_split[sql_split.length - (x+1)].equals("limit")) {
                            re_sql += " limit " + rowCount;
                        }
                        if (!sql_split[sql_split.length - (x+3)].equals("offset") && !sql_split[sql_split.length - (x+1)].equals("offset")) {
                            re_sql += " offset " + startRow;
                        }
                        break;
                    }
                }else{
                    re_sql = sql;
                }
                System.out.println("new 쿼리문 : "+re_sql);


                pstmt = conn.prepareStatement(re_sql);
                rs = pstmt.executeQuery();

                ResultSetMetaData rsmd = rs.getMetaData();

                int columnCount = rsmd.getColumnCount();

                String[] columnNames = new String[columnCount];
                for(int i=1; i<=columnCount; i++) {
                    columnNames[i-1] = rsmd.getColumnName(i);
                }


                Map<String, String> list = new HashMap<>();
                for (String columnName: columnNames) {
                    list.put(columnName,null);
                }
                arr.add(list);

                while(rs.next()) {
                    list = new HashMap<>();
                    for (String columnName : columnNames) {
                        list.put(columnName, String.valueOf(rs.getObject(columnName)));
                    }
                    arr.add(list);
                }



    //            System.out.println("데이터"+arr);
            }catch (SQLException e){
                Map<String, String> list = new HashMap<>();
                list.put("err",null);
                arr.add(list);
                list = new HashMap<>();
                list.put("err",e.toString());
                arr.add(list);
                return arr;
            }finally{
                try{
                    if (rs != null && rs.isClosed()) {
                        rs.close();
                    }
                    if (conn != null && conn.isClosed()) {
                        conn.close();
                    }
                    if(pstmt != null && !pstmt.isClosed()){
                        pstmt.close();
                        conn.close();
                    }
                }catch (SQLException e){
                    e.printStackTrace();
                }
            }

            return arr;
        }


        public ResponseEntity<byte[]> csvDownload(String name, String sql, HttpServletResponse response){

            System.out.println("csvDataCreate 실행");
            Connection conn = null;
            ResultSet rs = null;
            PreparedStatement pstmt = null;
            CSVPrinter csvPrinter = null;
            StringWriter sw = new StringWriter();
            try {

                conn = DriverManager.getConnection(url,username,password);

                System.out.println("쿼리문 : "+sql);
                pstmt = conn.prepareStatement(sql);
                rs = pstmt.executeQuery();

                ResultSetMetaData rsmd = rs.getMetaData();

                int columnCount = rsmd.getColumnCount();

                String[] columnNames = new String[columnCount];
                for(int i=1; i<=columnCount; i++) {
                    columnNames[i-1] = rsmd.getColumnName(i);
                }
                csvPrinter = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader(columnNames));

                while(rs.next()) {
                    List<String> row_data= new ArrayList<>();
                    for(int i=1; i<=columnCount; i++) {
                        row_data.add(String.valueOf(rs.getObject(rsmd.getColumnName(i))));
                    }
                    csvPrinter.printRecord(row_data);
                }
                sw.flush();
                byte[] csvFile = sw.toString().getBytes("UTF-8");

                HttpHeaders header = new HttpHeaders();
                header.setContentType(MediaType.valueOf("text/csv"));
                header.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=csv_download.csv");
                header.setContentLength(csvFile.length);
                return new ResponseEntity<byte[]>(csvFile, header, HttpStatus.OK);

            }catch (SQLException | IOException e) {
                e.printStackTrace();
            } finally{
                try{
                    if(csvPrinter != null){
                        csvPrinter.close();
                    }
                    if (rs != null && rs.isClosed()) {
                        rs.close();
                    }
                    if (conn != null && conn.isClosed()) {
                        conn.close();
                    }
                    if(pstmt != null && !pstmt.isClosed()){
                        pstmt.close();
                        conn.close();
                    }
                }catch (SQLException | IOException e){
                    e.printStackTrace();
                }
            }
            return null;
        }
    }


