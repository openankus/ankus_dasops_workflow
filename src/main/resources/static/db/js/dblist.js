

let dbconninfo = {} // db연결 정보 변수
let client_startRow = null     // 사용자가 지정한 시작위치
let client_rowCount = null     // 사용자가 지정한 row 최대 갯수
let startRow = 0    // 테이블 시작위치
let rowCount = 50  // row 최대 갯수
let newSqlSearchSetting = {} // sql 조회 최신 설정
let dataTableScrollCheck = 1
let query_result_count = 1      // number 갯수 카운터 하기 위한 변수(number)
let key = {13:0,17:0,'run':1}        // sql 실행하기 위한 key 조건을 담은 변수
let table_search = {'false':""}         // 테이블 조회 {여부 , 값}

// 모달창 팝업
$(function () {
    $('.add').click(function () {
        $(".add_modal_title").text("DB연결 등록")
        let el = document.querySelectorAll(".modal input")
        for(let i=0;i<el.length;i++){
            el[i].value = ''
        }
        document.querySelector(".modal .selected-value").textContent = 'DB 종류'
        document.querySelectorAll(".db_connect_info_txt li")[1].style.display = 'none'
        document.querySelectorAll(".db_connect_info_txt li")[2].style.display = 'none'
        $('.modal_bg').stop().fadeIn();
    });
    $('.edit').click(function () {
        $(".add_modal_title").text("DB연결 수정")
        dbLoad(document.querySelector(".data_name").title)
        document.querySelectorAll(".db_connect_info_txt li")[1].style.display = 'none'
        document.querySelectorAll(".db_connect_info_txt li")[2].style.display = 'inline'
        $('.modal_bg').stop().fadeIn();
    });
    $('.md_cancel').click(function () {
        $('.modal_bg').stop().fadeOut();
    });

    document.querySelector(".module_warning_bg button").addEventListener("click",() => {
        document.querySelector(".module_warning_bg").style.display = 'none'
        document.querySelector(".modal_bg").style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
    })
});

$('a[href="#"]').click(function (e) {
    e.preventDefault();
});

// DB 저장 또는 수정 버튼 활성화 여부
$(function(){


    // 연결정보명 중복 확인
    document.querySelector(".db_connect_info input").addEventListener("change",function(){
        if(document.getElementsByClassName("add_modal_title")[0].textContent.includes("등록")){
            document.querySelector(".db_connect_id").title = ""
        }

        $.ajax({
            type: 'POST',
            data: { "name": document.querySelector(".db_connect_info_txt input").value },
            url: "dbconn_name_search",
            success: function (success) {
                console.log(success)
                let el = document.querySelectorAll(".db_connect_info_txt li")
                for(let i=1;i<el.length;i++){
                    el[i].style.display = 'none'
                }
                if (success === "") {
                    el[2].style.display='inline'
                }else if(document.querySelector(".db_connect_id").title.toString() === success){
                    el[2].style.display='inline'
                } else {
                    el[1].style.display='inline'
                    document.querySelector(".db_connect_info input").value = ''
                    document.querySelector(".db_connect_info input").focus()
                }
            }, error: function (error) {
                console.log(error)
            }
        });
    })

})

$(function () {
    load(); // 데이터 테이블
    
    // tree 이벤트 처리
    document.getElementsByClassName("tree_all")[0].addEventListener("mouseup", function (e) {
        if(e.target.tagName==='IMG'){
            if(e.target.alt === "fill_ex"){
                document.querySelector(".delete_modal_bg").style.display = 'block'
                document.querySelectorAll(".modal_btn_list button")[1].value = e.target.parentNode.value
            }else{
                let el = document.querySelectorAll(".tree_all label")
                for(let i=0;i<el.length;i++){
                    el[i].classList.remove("backgroundColor_c0dbff")
                }
                e.target.parentNode.classList.add("backgroundColor_c0dbff")
            }
        }
        if(e.target.tagName === "SPAN"){
            let el = document.querySelectorAll(".tree_all label")
            for(let i=0;i<el.length;i++){
                el[i].classList.remove("backgroundColor_c0dbff")
            }
            e.target.parentNode.classList.add("backgroundColor_c0dbff")
        }else if(e.target.tagName === "LABEL"){
            let el = document.querySelectorAll(".tree_all label")
            for(let i=0;i<el.length;i++){
                el[i].classList.remove("backgroundColor_c0dbff")
            }
            e.target.classList.add("backgroundColor_c0dbff")
        }else if(e.target.tagName === "LI"){
            let el = document.querySelectorAll(".tree_all label")
            for(let i=0;i<el.length;i++){
                el[i].classList.remove("backgroundColor_c0dbff")
            }
            e.target.querySelector("label").classList.add("backgroundColor_c0dbff")
        }
    })
})
function enableTab(){
    document.querySelector('.data_query textarea').onkeydown = function (e) {
        if (e.keyCode === 9) {        // tab key
            let val = this.value,
                start = this.selectionStart,
                end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = val.substring(0, start) + '\t' + val.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 1;

            // prevent the focus lose
            return false;
        }
        if(e.keyCode === 17){       // ctrl
            key[e.keyCode] = 1
        }
        if(e.keyCode===13){         // enter
            key[e.keyCode] = 1
        }
        if(key[17]===1 && key[13]===1 && key['run'] === 1){     // sql 작성 및 ctl+enter 처리
            document.getElementsByClassName('query_btn')[0].click()
            key['run'] = 0
        }
    }
    document.querySelector('.data_query textarea').onkeyup = function (e) {
        if(e.keyCode === 17){       // ctrl
            key[e.keyCode] = 0
            key['run'] = 1
        }
        if(e.keyCode===13){         // enter
            key[e.keyCode] = 0
            key['run'] = 1
        }
    }

}


window.onload = function () {
    enableTab()

    document.querySelector(".search input").onkeyup = function(e){
        if(e.keyCode===13){         // enter
            document.querySelector(".search p").click()
        }
    }

    // 테이블 검색
    document.querySelector(".search p").addEventListener("click", function (e) {
        // document.querySelector(".tree_all li li label").textContent
        let el = document.querySelectorAll(".tree_all img")
        let text = document.querySelector(".search input").value
        for(let i=0;i<el.length;i++){
            if(el[i].alt === 'excel'){
                if(!el[i].parentElement.textContent.includes(text)){
                    el[i].parentElement.parentElement.style.display='none'
                }else{
                    el[i].parentElement.parentElement.style.display='inline'
                }
            }
        }
        table_search = {'true':text};
        if(text.replace(/ /g,"") === ""){
            document.querySelector(".search_info").textContent = "필터 적용이 되어 있지 않습니다"
        }else {
            document.querySelector(".search_info").textContent = "'" + text + "' 에 대한 필터 결과"
        }
    })

    // 완료 모달창 x버튼 이벤트
    document.querySelector('.complete_modal_bg img').addEventListener('click',function(){
        document.querySelector('.complete_modal_bg').style.display='none'
        load();
    })

    // 완료 모달창 확인버튼 이벤트
    document.querySelector('.complete_modal_bg button').addEventListener('click',function(){
        document.querySelector('.complete_modal_bg').style.display='none'
        load();
    })

    // 삭제 모달창 X버튼 이벤트
    document.querySelector(".delete_modal img").addEventListener("click", function () {
        document.querySelector(".delete_modal_bg").style.display = 'none'
    })
    // 삭제 모달창 취소버튼 이벤트
    document.querySelectorAll(".modal_btn_list button")[0].addEventListener("click", function () {
        document.querySelector(".delete_modal_bg").style.display = 'none'
    })
    // 삭제 모달창 삭제버튼 이벤트
    document.querySelectorAll(".modal_btn_list button")[1].addEventListener("click", function () {
        $.ajax({
            url: 'dbconn_delete',
            type: "POST",
            data: { name: document.querySelectorAll(".modal_btn_list button")[1].value },
            success: function (data) {
                if (data === 0) {
                    document.querySelector('.complete_modal_bg').style.display='block'
                    document.querySelector('.complete_modal_bg .complete_txt').textContent = '삭제가 완료되었습니다.'
                    load();
                }
            },
            error: function (err) {
                console.log(err)
            }
        });

        document.querySelector(".delete_modal_bg").style.display = 'none'
    })



    // DB연결 등록 저장 버튼
    document.querySelector(".md_add").addEventListener("click", function (e) {
        if(DB_Connect_input_check() === false) {
            document.querySelector(".modal_bg").style.backgroundColor = 'rgba(0, 0, 0, 0)'
            return false;
        }

        let dbType = document.querySelector(".selected-value").textContent
        let id = document.querySelector(".db_connect_id").title
        let name = document.querySelector('.db_connect_info input').value
        let url = document.querySelector(".db_connect_url input").value
        let port = document.querySelector(".db_connect_port input").value
        let userid= document.querySelector(".db_connect_id input").value
        let password= document.querySelector(".db_connect_password input").value
        let dbname= document.querySelector(".db_connect_name input").value
        let type= document.querySelector(".selected-value").textContent

        let data = {
            "id":parseInt(id),
            "name": name,
            "url": url,
            "port": port,
            "userid": userid,
            "password": password,
            "dbname": dbname,
            "type": type
        }
        if(document.querySelector(".add_modal_title").textContent.includes("등록")) {     // 등록
            delete data.id
            document.querySelector('.complete_modal_bg .complete_txt').textContent = 'DB연결 등록이 완료되었습니다.'
        }else{              // 수정
            document.querySelector('.complete_modal_bg .complete_txt').textContent = 'DB연결 수정이 완료되었습니다.'
        }

        $.ajax({
            type: 'POST',
            data: data,
            url: "dbSave",
            success: function (success) {
                document.querySelector(".modal_bg").style.display = 'none'
                document.getElementsByClassName('complete_modal_bg')[0].style.display='block'

            }, error: function (error) {
                console.log(error)
            }
        })

    })

    // 셀렉트 박스
    document.querySelector(".select").addEventListener("click", function (e) {
        const targetElement = e.target;
        const isOptionElement = targetElement.classList.contains("option");


        if (isOptionElement) {
            const selectBox = targetElement.closest(".select");
            const selectedElement = selectBox.querySelector(".selected-value");
            selectedElement.textContent = targetElement.textContent;
        }
        document.querySelector(".select").classList.toggle("active");
    });

    document.querySelector(".select ul").addEventListener("click", function (e) {


        const targetElement = e.target;
        const isSelect = targetElement.classList.contains("select") || targetElement.closest(".select");

        if (isSelect) {
            return;
        }

        const allSelectBoxElements = document.querySelectorAll(".select");

        allSelectBoxElements.forEach(boxElement => {
            boxElement.classList.remove("active");

        });

    });

    // 쿼리 실행
    document.querySelector(".query_btn").addEventListener("click", function (e) {
        if (Object.keys(dbconninfo).length === 0) {
            alert("현재 등록된 DB가 없습니다")
        } else {
            // console.log(document.querySelector(".data_query textarea").value.replaceAll("\n"," ").replaceAll("\t"," ").replaceAll(";","\n").replace(/ {2,}/g," "))


            if(document.querySelector(".data_query textarea").value.replaceAll("\n","").replaceAll(" ","").replaceAll("\t","") === ""){
                document.querySelector(".module_warning_bg .module_warning_txt").textContent = "쿼리문을 입력해주세요"
                document.querySelector(".module_warning_bg").style.display = 'inline'

            }else {

                newSqlSearchSetting["sql"] = document.querySelector(".data_query textarea").value.replaceAll("\n"," ").replaceAll("\t"," ").replaceAll(";","").replace(/ {2,}/g," ")
                newSqlSearchSetting["name"] = document.querySelector(".data_name").title
                dataTable_loading()

                query_result(0, newSqlSearchSetting["name"], newSqlSearchSetting["sql"])
            }
        }
    })

    // document.querySelector(".excel_btn").addEventListener("click",csv_download)
}

function load() {
document.querySelector('.tree_all').innerHTML = '<div class="dataloading"><img src="/common/images/db/dataloading.gif" alt="로딩gif"></div>'
    $.ajax({
        url: 'dbSelct',
        type: "POST",
        success: function (data) {
        if (data.length === 0) {
                document.querySelector('.tree_all').innerHTML = ''
                $(".tree_all").append('' +
                    '<ul class="no_search">'+
                        '<li><img src="common/images/db/no_search.svg" alt="검색결과아이콘"></li>'+
                        '<li>검색 결과가 없습니다.</li>'+
                    '</ul>'
                )
            } else {

                document.querySelector('.tree_all').innerHTML = ''
                for (let i = 0; i < data.length; i++) {
                    if (i === 0) {
                        document.querySelector(".data_name").title = data[i].name
                        document.querySelectorAll(".data_name li")[2].textContent = data[i].name+" : "
                        document.querySelectorAll(".data_name li")[3].textContent = data[i].dbname
                        document.querySelectorAll(".data_name li")[4].textContent = " - "+data[i].url+":"+data[i].port
                    }
                    $(".tree_all").append('' +
                        '<ul class="tree" title="' + data[i].dbname + " - " + data[i].url + ":" + data[i].port + '">' +
                        '<li>' +
                        '<input type="checkbox" id="' + data[i].name + '" checked>' +
                        '<label for="' + data[i].name + '" class="root '+(i===0 ? "backgroundColor_c0dbff" : "")+'"><img src="/common/images/db/database.png" alt="database">' +
                        '<span>' + data[i].name +'</span>' +
                        '<button value="' + data[i].name + '"><img src="/common/images/db/fill_ex.svg" alt="fill_ex"></button>' +
                        '</label>' +
                        '</li>' +
                        '</ul>'
                    )
                    data[i]["ch"] = 0
                    dbconninfo[data[i].name] = data[i]
                    document.getElementsByClassName("root")[i].addEventListener('click',function (e){
                        if(dbconninfo[data[i].name].ch === 0) {
                            if (data[i].type === "PostgreSQL") {
                                schemasList("PostgreSQL",data[i].name)
                            } else if (data[i].type === "MariaDB") {
                                tableList("MariaDB",data[i].name, data[i].dbname, null)
                            }
                        }
                    })

                    document.getElementsByClassName("tree")[i].addEventListener("click", function (e) {
                        document.querySelectorAll(".data_name li")[2].textContent = document.getElementsByClassName('tree')[i].children[0].children[1].htmlFor + ' : '
                        document.querySelectorAll(".data_name li")[3].textContent = document.getElementsByClassName('tree')[i].title.split(" ")[0]
                        document.querySelectorAll(".data_name li")[4].textContent = " - "+document.getElementsByClassName('tree')[i].title.split(' ')[2]

                        document.querySelector(".data_name").title = document.getElementsByClassName("tree")[i].getElementsByTagName("button")[0].value
                    })

                    // 삭제 모달창 오픈 이벤트

                }
            }

        },
        error: function (err) {
            console.log(err)
        }
    });
}


function dbLoad(name) {
    $.ajax({
        type: 'POST',
        data: { "name": name },
        url: "dbInformation",
        success: function (data) {
            console.log(data)
            document.querySelector('.db_connect_info input').value = data['name']
            document.querySelector(".db_connect_url input").value = data['url']
            document.querySelector(".db_connect_port input").value = data['port']
            document.querySelector(".db_connect_id input").value = data['userid']
            document.querySelector(".db_connect_password input").value = data['password']
            document.querySelector(".db_connect_name input").value = data['dbname']
            document.querySelector(".selected-value").textContent = data['type']
            document.querySelector(".db_connect_id").title = data['id']

        }, error: function (error) {
            console.log(error)
        }
    })

}
function schemasList(type,name){

    $.ajax({
        url: 'schemasList',
        type: "POST",
        async: false,
        data: {
            name: name
        },
        success: function (data) {
            if(Object.keys(data[0])[0] != 'err') {
                let t = ""
                if(data.length==0){
                    t = no_db_connect_ui()
                }else {
                    for (let i = 0; i < data.length; i++) {
                        t += "<ul>"
                        t += "<li>"
                        t += "<input type='checkbox' id='" + name + "-" + data[i].schema + "' checked>";
                        t += "<label for='" + name + "-" + data[i].schema + "' class='root_sub'>";
                        t += "<img src='/common/images/db/folder.png' alt='folder'>";
                        t += data[i].schema + "</label>"
                        t += "</li>"
                        t += "</ul>"
                    }
                }
                document.getElementById(name).parentNode.innerHTML += t
                document.getElementById(name).parentNode.firstChild.click()

                for (let i = 0; i < data.length; i++) {
                    document.getElementById(name + "-" + data[i].schema).addEventListener("click", function () {
                        tableList("PostgreSQL", name, data[i].catalog, data[i].schema)
                    })
                }

                dbconninfo[name]["ch"] = 1
            }else{
                console.log(data)
                document.getElementById(name).parentNode.innerHTML += db_connect_error_ui(data[0].err)
                document.getElementById(name).parentNode.firstChild.click()

            }
        },error: function (err){
            console.log(err)
            dbconninfo[name]["ch"] = 0
        }
    })
}

function tableList(type,name,catalog,schema){
    $.ajax({
        url: 'tableList',
        type: "POST",
        async: false,
        data: {
            name:name,
            catalog: catalog,
            schema: schema,
        },
        success: function (data) {
            if(data[0] !== "err") {
                let t = ""
                if(data.length===0){
                    t = no_db_connect_ui()
                }else {
                    let classadd = "root_sub_sub1"
                    if(type==="MariaDB"){
                        classadd = "root_sub"
                    }


                    for (let i = 0; i < data.length; i++) {
                        let display = 'inline'
                        if(Object.keys(table_search)[0]==='true' && !data[i].includes(table_search['true'])){
                            display = 'none'
                        }

                        t += "<ul>"
                        t += "<li style='display: "+display+"'>"
                        t += "<input type='checkbox' id='" + name + "-" + schema + "-" + data[i] + "' checked>";
                        t += "<label for='" + name + "-" + schema + "-" + data[i] + "' class='"+classadd+"'>";
                        t += "<img src='/common/images/db/excel.png' alt='excel'>";
                        t += data[i] + "</label>"
                        t += "</li>"
                        t += "</ul>"
                    }
                }

                if (type === "PostgreSQL") {
                    document.getElementById(name + "-" + schema).parentNode.innerHTML += t
                    document.getElementById(name + "-" + schema).parentNode.firstChild.click()
                } else if (type === "MariaDB") {
                    document.getElementById(name).parentNode.innerHTML += t
                    document.getElementById(name).parentNode.firstChild.click()
                }

                for (let i = 0; i < data.length; i++) {
                    document.getElementById(name + "-" + schema + "-" + data[i]).addEventListener("click", function () {
                        columnList(type, name, catalog, schema, data[i])
                    })
                }
            }else{
                let t = db_connect_error_ui(data[1])

                if (type === "PostgreSQL") {
                    document.getElementById(name + "-" + schema).parentNode.innerHTML += t
                    document.getElementById(name + "-" + schema).parentNode.firstChild.click()
                } else if (type === "MariaDB") {
                    document.getElementById(name).parentNode.innerHTML += t
                    document.getElementById(name).parentNode.firstChild.click()
                }

            }

        },error: function (err){
            console.log(err)
        }
    })
}
function columnList(type,name,catalog,schema,table){
    $.ajax({
        url: 'columnList',
        type: "POST",
        async: false,
        data: {
            name:name,
            catalog: catalog,
            schema: schema,
            table: table
        },
        success: function (data) {
            if(Object.keys(data)[0] != "err") {
                let t = ""
                if(Object.keys(data).length==0){
                    t = no_db_connect_ui()
                }else {
                    let classadd = "root_sub_sub_sub2"
                    if(type==="MariaDB"){
                        classadd = "root_sub_sub2"
                    }

                    Object.keys(data).map(value => {
                        t += "<ul><li class='last'>"
                        t += "<input type='checkbox' id='" + name + "-" + schema + "-" + table + "-" + value + "' checked>"
                        if (data[value].toLowerCase().includes("integer") || data[value].toLowerCase().includes("int") || data[value].toLowerCase().includes("float") || data[value].toLowerCase().includes("bit") || data[value].toLowerCase().includes("double") || data[value].toLowerCase().includes("numeric") || data[value].toLowerCase().includes("serial") || data[value].toLowerCase().includes("real") || data[value].toLowerCase().includes("decimal") || data[value].toLowerCase().includes("number")) {
                            t += "<label for='" + name + "-" + schema + "-" + table + "-" + value + "' class='last "+classadd+"'><img src='/common/images/db/number.png' alt='number'>" + value + "(" + data[value] + ")</label>"
                        } else if (data[value].toLowerCase().includes("timestamp") || data[value].toLowerCase().includes("date") || data[value].toLowerCase().includes("time") || data[value].toLowerCase().includes("interval") || data[value].toLowerCase().includes("year")) {
                            t += "<label for='" + name + "-" + schema + "-" + table + "-" + value + "' class='last "+classadd+"'><img src='/common/images/db/time.png' alt='time'>" + value + "(" + data[value] + ")</label>"
                        } else {
                            t += "<label for='" + name + "-" + schema + "-" + table + "-" + value + "' class='last "+classadd+"'><img src='/common/images/db/string.png' alt='string'>" + value + "(" + data[value] + ")</label>"
                        }
                        t += "</li></ul>"
                    })
                }

                document.getElementById(name + "-" + schema + "-" + table).parentNode.innerHTML += t
                document.getElementById(name + "-" + schema + "-" + table).parentNode.firstChild.click()

            }else{

                document.getElementById(name + "-" + schema + "-" + table).parentNode.innerHTML += db_connect_error_ui(data["err"])
                document.getElementById(name + "-" + schema + "-" + table).parentNode.firstChild.click()

            }
        },error: function (err){
            console.log(err)
        }
    })
}


function dataTable_show(add,res) {
    let count_break = 0
    // 테이블 처음 생성 초기값 설정
    // 쿼리 버튼 클릭시 동작
    if (add === 0) {
        if(res.length === 1){       // 데이터가 없을때
            document.querySelector(".table_wrap p").textContent = "데이터가 없습니다"
            document.querySelector(".table_wrap p").style.display = 'block'
            document.getElementsByClassName("table")[0].style.display = 'none'
            document.querySelector(".search_result").textContent = "rows : 0"
            return false;
        }
        if(Object.keys(res[1])[0] === "err"){           // DB에 문제가 생겼을때
            console.log(res)
            document.querySelector(".table_wrap p").textContent = res[1]["err"]
            document.querySelector(".table_wrap p").style.display = 'block'
            document.getElementsByClassName("table")[0].style.display = 'none'
            document.querySelector(".search_result").textContent = "rows : xx"
            return false;
        }

        document.getElementsByClassName("table")[0].style.display = 'table'
        query_result_count = 1
        document.querySelector(".table_wrap p").style.display = 'none'
        document.querySelector("#resizeMe tbody").innerHTML = ""
        let column_w = 100                                                                  // 컬럼 크기 초기 값은 100px 지정
        let table_w = 40
        let column_t = '<tr><th class="no_resizer" style="width: 40px"></th>'               // number(번호) 나오는 곳은 40px로 고정

        if (Object.keys(res[0]).length < 8) {
            column_w = Math.trunc(800 / Object.keys(res[0]).length) + 1
        }

        for (let key in res[0]) {

            column_t += '<th style="width: ' + column_w + 'px" class="column_' + key + '"><label>' + key + '</label><div class="resizer"></div></th>'
            table_w += column_w
        }
        column_t += '</tr>'
        document.querySelector("#resizeMe thead").innerHTML = column_t
        createResizableTable(document.getElementById('resizeMe'));
        document.getElementsByTagName('table')[0].style.width = table_w + "px"      // table 초기 크기 40 + (컬럼갯수 * 100)

        count_break = res.length < 16 ? (16 - res.length) + res.length : res.length
    }
    count_break = res.length
    for (let i = 1; i < count_break; i++) {
        let data_t = "<tr><td>" + query_result_count + "</td>"
        if (i >= res.length) {
            data_t = "<tr><td></td>"
        }
        for (let key in res[i]) {
            data_t += '<td class="column_' + key + '"><label>' + res[i][key] + '</label></td>'
        }
        if (i >= res.length) {
            for (let k = 0; k < Object.keys(res[0]).length; k++) {
                data_t += '<td class="column_' + Object.keys(res[0])[k] + '"><label></label></td>'
            }
        }
        data_t += "</tr>"
        document.querySelector("#resizeMe tbody").innerHTML += data_t
        query_result_count += 1
    }

    let rows = document.querySelector(".search_result")
    if(rows.textContent.includes('xx')){
        rows.textContent = "rows : " + (res.length-1)
    }else{
        if(add === 0){
            rows.textContent = "rows : " + (res.length-1)
        }else{
            rows.textContent = "rows : " + (parseInt(rows.textContent.replace("rows : ",""))+res.length-1)
        }
    }

    if(res.length-1 === rowCount){
        dataTableScrollCheck = 1
    }else{
        dataTableScrollCheck = 0
    }

    // 데이터를 다시 불러오고 난 후에 스크롤을 위로 올리기 위해 밑에 있음
    // 쿼리 버튼 클릭시 동작
    if(add===0){
        document.querySelector(".table_wrap").scrollTo(0,0)
    }

    // workflow_add()
}

// 쿼리 실행 버튼 클릭시 초기화 작업
function dataTable_loading(){
    startRow = 0
    rowCount = 50
}

function query_result(add,name,data_query){
    if(add === 0){

        client_rowCount = null
        client_startRow = null
        let sql_split = data_query.split(" ")
        let x = 1
        while (true) {
            if(sql_split[sql_split.length - x] === ""){
                x += 1;
                continue;
            }

            if (sql_split[sql_split.length - (x+3)] === "limit") {
                client_rowCount = parseInt(sql_split[sql_split.length - (x+2)])
            }
            if (sql_split[sql_split.length - (x+1)] === "limit") {
                client_rowCount = parseInt(sql_split[sql_split.length - x])
            }
            if (sql_split[sql_split.length - (x+3)] === "offset") {
                client_startRow = parseInt(sql_split[sql_split.length - (x+2)])
            }
            if (sql_split[sql_split.length - (x+1)] === "offset") {
                client_startRow = parseInt(sql_split[sql_split.length - x])
            }
            break
        }
        startRow = client_startRow == null ? startRow : client_startRow
    }

    let newRowCount = rowCount
    if(client_rowCount !== null) {
        if (client_rowCount > rowCount) {
            client_rowCount -= rowCount
        } else {
            newRowCount = client_rowCount
        }
    }else{
        newRowCount = rowCount
    }
    // select * from ankus_advance_simple.csvtest limit 51

    $.ajax({
        url: 'query_result',
        type: "POST",
        dataType:"json",
        data: {
            name: dbconninfo[name].name,
            sql: data_query,
            startRow: startRow,
            rowCount: newRowCount,
        },
        success:function (data){
            dataTable_show(add,data)
            scroll_event()
        },
        error: function (err){
            console.log(err)
        }
    })



}

function csv_download(){
    if(document.querySelector(".table_wrap p").style.display !== "none"){
        return false;
    }
    document.querySelectorAll("#csv_download input")[0].value = newSqlSearchSetting["name"]
    document.querySelectorAll("#csv_download input")[1].value = newSqlSearchSetting["sql"]
    document.getElementById("csv_download_btn").click()

}

function scroll_event(){
    //  결과 테이블 스크롤 이벤트
    document.getElementById("resizeMe").parentNode.addEventListener("scroll", function (e) {
        if (parseInt(this.scrollHeight - this.scrollTop) < this.clientHeight + 50) {
            if (dataTableScrollCheck === 1) {
                dataTableScrollCheck=0
                startRow += rowCount
                const data_query = newSqlSearchSetting['sql']
                const name = newSqlSearchSetting['name']
                query_result(1,name,data_query)
            }
        }
    })
}

function db_connect_error_ui(data){
    let t = '<ul class="error_list">'
        t +=    '<li>'+data.split(":")[0]+'</li>'
        t +=    '<li><span>error - </span> '+data.split("Exception:")[1]+'</li>'
        t += '</ul>'

    return t
}

function no_db_connect_ui(){
    let t = '<ul class="no_search">'
        t +=    '<li><img src="common/images/nosearch.png" alt="검색결과아이콘"></li>'
        t +=    '<li>검색 결과가 없습니다.</li>'
        t += '</ul>'
    return t;
}

function format(d){
    let keys = Object.keys(d);
    let t = '<table style="padding-left:50px; border 0;">'
    for(let i=0;i<keys.length;i++){
        if(keys[i] != "") {
            t += '<tr>'
            t += '<td>' + keys[i] + ' : ' + d[keys[i]] + '</td>'
            t += '<tr>'
        }
    }
    t += '</table>'
    return t
}


//테이블 사이즈 조절
const createResizableTable = function (table) {
    const cols = table.querySelectorAll('th');
    [].forEach.call(cols, function (col) {
        // Add a resizer element to the column
        // const resizer = document.createElement('div');
        // resizer.classList.add('resizer');
        //
        // // Set the height
        // resizer.style.height = `${table.offsetHeight}px`;
        //
        // col.appendChild(resizer);
        if(col.className != 'no_resizer') {
            const resizer = col.getElementsByClassName('resizer')[0]
            createResizableColumn(col, resizer);
        }
    });
};

const createResizableColumn = function (col, resizer) {
    let x = 0;
    let w = 0;

    const mouseDownHandler = function (e) {
        x = e.clientX;

        const styles = window.getComputedStyle(col);
        w = parseInt(styles.width, 10);

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        resizer.classList.add('resizing');
    };

    const mouseMoveHandler = function (e) {
        const dx = e.clientX - x;
        if(w + dx >= 40) {
            col.style.width = `${w + dx}px`;

            let el = document.getElementsByTagName('th')
            let ww = 0
            for (let i = 0; i < el.length; i++) {
                ww += parseInt(document.getElementsByTagName('th')[i].style.width.replace("px", ""))
                // document.getElementById('resizeMe').scrollLeft = ww
            }
            document.getElementsByTagName('table')[0].style.width = ww + "px"
        }
    };

    const mouseUpHandler = function () {
        resizer.classList.remove('resizing');
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    resizer.addEventListener('mousedown', mouseDownHandler);

    resizer.addEventListener("dblclick", function(e){
        let width_max = 0
        let el = document.querySelectorAll("."+e.target.parentNode.className)
        for(let i=0;i<el.length;i++){
            if(width_max < el[i].getElementsByTagName('label')[0].offsetWidth){
                width_max = el[i].getElementsByTagName('label')[0].offsetWidth
            }
        }
        e.target.parentNode.style.width = (width_max < 20 ? 40 : width_max+20) + "px";
    })
};

// DB 정보 모두 입력 했는지 확인
function DB_Connect_input_check(){
    let dbType = document.querySelector(".selected-value").textContent
    let name = document.querySelector('.db_connect_info input').value
    let url = document.querySelector(".db_connect_url input").value
    let port = document.querySelector(".db_connect_port input").value
    let userid= document.querySelector(".db_connect_id input").value
    let password= document.querySelector(".db_connect_password input").value
    let dbname= document.querySelector(".db_connect_name input").value

    if(dbType === "DB 종류"){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "DB 종류를 선택해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(name.replace(/ /g,'') === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "연결정보명을 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(url.replace(/ /g,'') === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "Database URL을 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(port.replace(/ /g,'') === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "DataBase PORT를 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(userid.replace(/ /g,'') === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "DataBase 사용자 아이디를 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(password.replace(/ /g,'') === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "DataBase 패스워드를 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    if(dbname.replace(/ /g,'') === ""){
        document.querySelector(".module_warning_bg .module_warning_txt").textContent = "DataBase 이름을 입력해주세요"
        document.querySelector(".module_warning_bg").style.display = 'inline'
        return false
    }
    return true
}
