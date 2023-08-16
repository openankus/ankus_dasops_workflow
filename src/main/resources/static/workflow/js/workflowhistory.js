let wfhistory_table    // 데이터 테이블-1
let wfhistory_table2   // 데이터 테이블-2
let run_conf_ch = 1 // 실행이력 조회 버튼 처음 클릭시에만 동작하기 위한 변수 , 실행이력조회 클릭 할때 마다 매번 새로운 데이터를 불러오지 못하게 하기 위한 변수


function run_conf() { // 상단 첫번째 테이블
    wfhistory_table=$('#wfhistory_table').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        searching: false,
        info: false,
        lengthChange: false,
        fixedHeader: true,
        bAutoWidth:false,
        destroy: true,
        responsive: true,
        orderable: true,
        order:[[2,'desc']],
        ajax: {
            "url": "workflow_exec_hist_select",
            "type": "POST",
            "data": {
                "id": workflowId
            },
            "dataSrc": function (res) {
                let data = res.data.content;
                for (let i = 0; i < data.length; i++) {
                    data[i]["num"] = ""
                    data[i]["open"] = "세부내용"
                    if (i === 0) {
                        let obj = detail_config(data[i])

                        document.querySelectorAll(".history_cont li")[0].textContent = '1';
                        document.querySelectorAll(".history_cont li")[1].textContent = obj.execCondType;
                        document.querySelectorAll(".history_cont li")[2].textContent = obj.typeContent;
                        document.querySelectorAll(".history_cont li")[3].textContent = data[0]['startDateTime'] !== null ? data[0]['startDateTime'].replace("T"," ").split(".")[0] : null;
                        detail_open(obj.id,1)
                    }
                }

                if(data.length===0){detail_open('no_data',1)}
                return data;
            }
        },
        columns: [
            {data: 'num'},
            {data: 'execStat'},
            {data: 'startDateTime'},
            {data: 'endDateTime'},
            {data: 'open'},
        ],
        columnDefs: [
            {
                targets: 0,
                width: "8%",
                searchable: false,
                orderable: false,
                className: "dt-center",
                render: function (data, type, full, meta) {
                    return data;
                }
            },
            {
                targets: 1,
                width: "22%",
                searchable: false,
                orderable: false,
                className: "dt-center",
                render: function (data, type, full, meta) {
                    if(data==="COMPLETE") return '<label>'+ data + '<img src="/common/images/workflow/success.svg" alt="success"> </label>' ;
                    else if(data==="RUNNING") return '<label>'+data + '<img src="/common/images/workflow/running.svg" alt="running"> </label>';
                    else if(data==="STOPPED") return '<label>'+data + '<img src="/common/images/workflow/stop_2.svg" alt="stop_2"> </label>';
                    else return '<label>'+data + '<img src="/common/images/workflow/fail.svg" alt="fail"> </label>';
                }
            },
            {
                targets: 2,
                width: "26%",
                searchable: false,
                className: "dt-center",
                render: function (data, type, full, meta) {
                    return data !== null ? data.replace("T"," ").split(".")[0] : null;
                }
            },
            {
                targets: 3,
                width: "26%",
                searchable: false,
                orderable: true,
                className: "dt-center",
                render: function (data, type, full, meta) {
                    return data !== null ? data.replace("T"," ").split(".")[0] : null;
                }
            },
            {
                targets: 4,
                width: "18%",
                searchable: false,
                orderable: false,
                className: "dt-center",
                render: function (data, type, full, meta) {

                    return '<button value=\''+JSON.stringify(detail_config(full))+'\'>'+data+'</button>';
                }
            },
        ]
    });

    wfhistory_table.on('order.dt draw.dt', function () {
        wfhistory_table.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        });
    }).draw();

    document.querySelector("#wfhistory_table").addEventListener("click",function (e) {
        if(e.target.nodeName==='BUTTON') {
            let obj = JSON.parse(e.target.value)
            console.log(obj)
            document.querySelectorAll(".history_cont li")[0].textContent = e.target.parentNode.parentNode.childNodes[0].textContent;
            document.querySelectorAll(".history_cont li")[1].textContent = obj.execCondType;
            document.querySelectorAll(".history_cont li")[2].textContent = obj.typeContent;
            document.querySelectorAll(".history_cont li")[3].textContent = e.target.parentNode.parentNode.childNodes[2].textContent;
            wfhistory_table2.clear()
            window.scrollTo(0, document.querySelector('.history_detail_all h3').offsetTop - 10);

            detail_open(obj.id,0)

        }
    })

}

function detail_open(id,ch) {
    //detail_open
    wfhistory_table2=$('#wfhistory_table2').DataTable({
        processing: true,
        serverSide: true,
        paging: false,
        destroy : true,
        searching: false,
        info: false,
        lengthChange: false,
        fixedHeader: true,
        bAutoWidth:false,
        scrollY: 370,
        responsive: true,
        order:[2,'asc'],
        language : {"zeroRecords": ""},
        ajax: {
            url: "step_exec_hist_select",
            type: "POST",
            data: {id:id},
            dataSrc: function (res) {

                return res.list[0]
            }
        },
        columns: [
            {data: 'name'},
            {data: 'execStat'},
            {data: 'startDateTime'},
            {data: 'endDateTime'},
            {data: 'conOutFilePath'},
        ],
        columnDefs: [
            {
                targets: [0, 1, 2, 3, 4],
                className: "dt-center"
            },
            {
                targets: [0],
                width: "25%",
                searchable: false,
                render: function (data, type, full, meta) {
                    return data;
                }
            },
            {
                targets: [1],
                width: "15%",
                orderable: false,
                searchable: false,
                render: function (data, type, full, meta) {
                    if(data==="COMPLETE") return '<label>'+ data + '<img src="/common/images/workflow/success.svg" alt="success"> </label>' ;
                    else if(data==="RUNNING") return '<label>'+data + '<img src="/common/images/workflow/running.svg" alt="running"> </label>';
                    else if(data==="STOPPED") return '<label>'+data + '<img src="/common/images/workflow/stop_2.svg" alt="stop_2"> </label>';
                    else return '<label>'+data + '<img src="/common/images/workflow/fail.svg" alt="fail"> </label>';
                }
            },
            {
                targets: [2],
                width: "20%",
                searchable: false,
                render: function (data, type, full, meta) {
                    return data !== null ? data.replace("T"," ").split(".")[0] : null;
                }
            },
            {
                targets: [3],
                width: "20%",
                searchable: false,
                orderable: true,
                render: function (data, type, full, meta) {
                    return data !== null ? data.replace("T"," ").split(".")[0] : null;
                }
            },
            {
                targets: [4],
                width: "20%",
                searchable: false,
                orderable: false,
                render: function (data, type, full, meta) {
                    if(data==='') return '';
                    return '<button value="'+data+'">콘솔 출력 결과</button>';
                }
            },
        ]
    })
    wfhistory_table2.on('draw',function (e) {
        if(e.target.querySelector("tbody tr").children.length>1) {
            document.querySelectorAll('.modify_name li')[1].textContent = e.target.querySelector("tbody tr").children[0].textContent
            log_load(e.target.querySelector("tbody tr").children[4].lastChild.value, 1);
        }
    })

    // 콘솔 출력 결과 클릭
    document.querySelector("#wfhistory_table2").addEventListener("click",function (e) {
        if(e.target.nodeName==='BUTTON') {
            console.log(e.target.nodeName)
            document.querySelectorAll('.modify_name li')[1].textContent = e.target.parentNode.parentNode.children[0].textContent
            log_load(e.target.value,0);
        }
    })

}

$(function(){
    if(url === "change"){
        document.getElementsByClassName('wfmodify_all')[0].style.display = 'inline';
        document.getElementsByClassName('history_wrap')[0].style.display = 'none';
        document.querySelectorAll('.tab_menu li')[0].style.color = '#001B54'
        document.querySelectorAll('.tab_menu li')[0].style.fontWeight = '700'

    }else{
        document.getElementsByClassName('wfmodify_all')[0].style.display = 'none';
        document.getElementsByClassName('history_wrap')[0].style.display = 'inline';
        document.querySelectorAll('.tab_menu li')[2].style.color = '#001B54'
        document.querySelectorAll('.tab_menu li')[2].style.fontWeight = '700'
        if(run_conf_ch==1){
            run_conf()
            run_conf_ch = 0
        }
    }

    // 탭 메뉴 수정 클릭시 동작
    document.querySelectorAll('.tab_menu li')[0].addEventListener('click',function (e){
        document.getElementsByClassName('wfmodify_all')[0].style.display = 'inline';
        document.getElementsByClassName('history_wrap')[0].style.display = 'none';

        document.querySelectorAll('.tab_menu li')[0].style.color = '#001B54'
        document.querySelectorAll('.tab_menu li')[0].style.fontWeight = '700'
        document.querySelectorAll('.tab_menu li')[2].style.color = '#3e3e3e'
        document.querySelectorAll('.tab_menu li')[2].style.fontWeight = '400'

    })
    document.querySelectorAll('.tab_menu li')[2].addEventListener('click',function (e){
        document.getElementsByClassName('wfmodify_all')[0].style.display = 'none';
        document.getElementsByClassName('history_wrap')[0].style.display = 'inline';
        document.querySelectorAll('.tab_menu li')[0].style.color = '#3e3e3e'
        document.querySelectorAll('.tab_menu li')[0].style.fontWeight = '400'
        document.querySelectorAll('.tab_menu li')[2].style.color = '#001B54'
        document.querySelectorAll('.tab_menu li')[2].style.fontWeight = '700'

        if(run_conf_ch==1){
            run_conf()
            run_conf_ch = 0
        }
    })

})

function log_load(path,ch){
    $.ajax({
        url: 'module_exec_con_out',
        type: "POST",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: {"filePath": path},
        dataType : 'json',
        success: function (data) {
            if(data['result']==='success') {
                document.querySelector(".console_box").value = data['content'].replaceAll("\n", '\r\n')
                if (ch === 0) window.scrollTo(0, document.body.scrollHeight);
            }else{
                // console.log('error')
                document.querySelector(".console_box").innerHTML = "파일이 없습니다.";

            }
        },
        error: function (err) {
            console.log(err)
        }
    });
}

function detail_config(data){
    let obj = {'id':data.id};
    let runtimeConfJson = JSON.parse(data['runtimeConfJson'])
    if(runtimeConfJson.execCondType === "PERIOD_DAY_TIME"){
        obj['execCondType'] = '요일 및 시각'
        let dayList = runtimeConfJson.execCondDayList
        let day = ""
        for (let i = 0; i < dayList.length; i++) {
            if (dayList[i] === "MONDAY") day += "월";
            else if (dayList[i] === "TUESDAY") day += "화";
            else if (dayList[i] === "WEDNESDAY") day += "수";
            else if (dayList[i] === "THURSDAY") day += "목";
            else if (dayList[i] === "FRIDAY") day += "금";
            else if (dayList[i] === "SATURDAY") day += "토";
            else if (dayList[i] === "SUNDAY") day += "일";
            if (dayList.length - 1 !== i) day += " ";
        }

        obj['typeContent'] = (dayList.length===7 ? '매일' : day) + ' / ' + runtimeConfJson['execCondHour'] + '시 ' + runtimeConfJson['execCondMin'] + '분'
    }else if(runtimeConfJson.execCondType === "PERIOD_CRON"){
        obj['execCondType'] = 'cron 형식'
        obj['typeContent'] = runtimeConfJson['execCondCronExp']
    }else{
        obj['execCondType'] = 'status 형식'
        obj['typeContent'] = runtimeConfJson['execCondEventName']
    }
    return obj
}