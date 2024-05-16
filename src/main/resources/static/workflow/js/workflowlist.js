let table   // 테이블
$(function (){
    setInterval(function () {

        const arr = document.querySelectorAll('.action_btn img')

        let ids = []
        for (let i = 0; i < arr.length; i++) {
            ids.push(arr[i].title)
        }

        if(ids.length>0) {
            $.ajax({
                url: 'workflow_onDemandCheck',
                type: "POST",
                data: {ids: ids},
                success: function (data) {
                    // console.log(data)
                    if (data.length === 0) {
                        for (let i = 0; i < arr.length; i++) {
                            arr[i].src = '/common/images/workflow/play.svg'
                            arr[i].alt = 'play'
                        }
                    } else {

                        for (let i = 0; i < arr.length; i++) {
                            let el = arr[i]
                            if (data.includes(parseInt(el.title))){
                                el.src = '/common/images/workflow/stop.svg'
                                el.alt = 'stop'
                            }else{
                                el.src = '/common/images/workflow/play.svg'
                                el.alt = 'play'
                            }
                        }
                    }
                },
                error: function (err) {
                    console.log(err)
                }
            });
        }
    }, 500)
})

function date_sta_end(data) {
    document.querySelectorAll("input[name=inp_date]")[0].value=data.split(" ")[0]
    document.querySelectorAll("input[name=inp_date]")[1].value=data.split(" ")[1]
}


window.onload=function(){

    document.querySelector(".search").addEventListener("click", function(e){
        let type = {"이름": "1", "등록자": "5"}
        if(document.querySelector(".selected-value").textContent==='검색구분'){
            alert("검색 구분 선택해주세요")
        }else{
            let numCols = table.columns().nodes().length;
            for (let i = 0; i < numCols; i++) {
                if (i != 6) {
                    table.column(i).search('');
                } else {
                    if(document.querySelectorAll("input[name=inp_date]")[0].value > document.querySelectorAll("input[name=inp_date]")[1].value){
                        let d = document.querySelectorAll("input[name=inp_date]")[1].value
                        document.querySelectorAll("input[name=inp_date]")[1].value = document.querySelectorAll("input[name=inp_date]")[0].value
                        document.querySelectorAll("input[name=inp_date]")[0].value = d
                    }
                    table.column(6).search(document.querySelectorAll("input[name=inp_date]")[0].value + " " + document.querySelectorAll("input[name=inp_date]")[1].value);
                }    // 수정일자를 제외한 나머지 값 초기화
            }

            let searchType = type[document.querySelector(".selected-value").textContent];
            let searchValue = document.querySelector('.keyword input').value;

            table.column(searchType).search(searchValue).draw();
        }
    })



    //데이터 테이블
    table=$('#table_id').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        searching: true,
        bFilter:false,
        info: false,
        lengthChange: false,
        destroy: true,
        responsive: true,
        order:[1,'asc'],
        orderable: true,
        "ajax": {
            "url": "workflow_select_pageable",
            "type": "POST",
            "dataSrc": function (res) {
                let data = res.data.content;
                for (let i = 0; i < data.length; i++) {
                    data[i]["select"] = data[i].id
                    data[i]["start"] = "start"
                    data[i]["stop"] = "stop"
                    data[i]["workflowHistory"]=data[i].id

                }
                date_sta_end(res.udate);     // 수정일자(시작날짜ID,종료날짜ID,가져온 값()


                return data;
            }
        },
        columns: [
            {"data": "select"},
            {"data": "name"},
            {"data": "execCondType"},
            {"data": "start"},
            {"data": "stop"},
            {"data": "createUser"},
            {"data": "updateDateTime"},
            {"data": "workflowHistory"},
        ],

        columnDefs: [
            {
                targets: [0, 1, 2, 3, 4, 5, 6, 7],
                className: "dt-center"
            },
            {
                targets: [0],
                // width: 40,
                searchable: false,
                orderable: false,
                render: function (data, type, full, meta) {
                    return '<input  type="checkbox" value="' + data + ' " name="check" >';
                }
            },
            {
                targets: [1],
                width:'15%',
                className: 'workflowName',
                render: function (data, type, full, meta) {
                    return data;
                }
            },
            {
                targets: [2],
                searchable: false,
                orderable: false,
                render: function (data, type, full, meta) {
                    if(data==="PERIOD_CRON"){
                        return '<p>CronTab</p><p>'+full['execCondCronExp']+'</p>';
                    }else if(data==='PERIOD_DAY_TIME'){
                        let d = ""
                        for(let i=0;i<full['execCondDayList'].length;i++){

                            if(full['execCondDayList'][i]==="MONDAY") d+= "월";
                            else if(full['execCondDayList'][i]==="TUESDAY") d+= "화";
                            else if(full['execCondDayList'][i]==="WEDNESDAY") d+= "수";
                            else if(full['execCondDayList'][i]==="THURSDAY") d+= "목";
                            else if(full['execCondDayList'][i]==="FRIDAY") d+= "금";
                            else if(full['execCondDayList'][i]==="SATURDAY") d+= "토";
                            else if(full['execCondDayList'][i]==="SUNDAY") d+= "일";
                            if(full['execCondDayList'].length-1!=i) d+=" ";
                        }

                        let hour = full['execCondHour']<10?"0"+full['execCondHour']:full['execCondHour']
                        let min = full['execCondMin']<10?"0"+full['execCondMin']:full['execCondMin']
                        return '<p>'+(full['execCondDayList'].length===7?"매일":("매주 "+d))+'</p><p>'+(hour+" : "+min)+'</p>';
                    }else{
                        return '<p>이벤트 청취</p><p>'+full['execCondEventName']+'</p>';
                    }

                }
            },
            {
                targets: [3],
                searchable: false,
                orderable: false,
                className: 'activate_btn',
                render: function (data, type, full, meta) {
                    if(full['actFlag']==='N') return '<div><button value="'+full['id']+'_N'+'"></button></div>';
                    else return '<div style="background: #378921;"><button style="left: 22px;" value="'+full['id']+'_Y'+'"></button></div>';
                }
            },
            {
                targets: [4],
                searchable: false,
                orderable: false,
                className: 'action_btn',
                render: function (data, type, full, meta) {
                    return '<img src="/common/images/workflow/play.svg" alt="play" title="'+full['id']+'">';
                }
            },
            {
                targets: [5],
                render:function (data, type, full, meta){
                    return '<p id="'+data.split("_")[0]+'">'+data.split("_")[1]+'</p>'
                }
            },
            {
                targets: [6],
                render:function (data, type, full, meta){
                    return data.replace("T"," ").split(".")[0]
                }
            },
            {
                targets: [7],
                searchable: false,
                orderable: false,
                render: function (data, type, full, meta) {
                    return '<button value="'+data+'">실행이력조회</button>';
                }
            },
        ],
    });
    document.getElementById("table_id_filter").style.display='none'




    // 체크박스 전체 선택
    document.querySelector("input[name=checkAll]").addEventListener("change", function (e) {
        e.preventDefault();
        let list = document.querySelectorAll("input[name=check]");
        for (let i = 0; i < list.length; i++) {
            list[i].checked = this.checked;
        }
    });


    document.querySelector("#table_id").addEventListener("click", function(e){
        // 실행이력조회 클릭
        if(e.target.nodeName==='BUTTON' && e.target.innerText==='실행이력조회') {
            location.href="workflow_history?id="+e.target.value
        }

        // 즉시동작 클릭시 해당 워크를로우 실행git
        if(e.target.nodeName==='IMG'){
            if(e.target.parentNode.parentNode.querySelectorAll("td")[5].querySelector("p").id !== document.querySelector(".lnb_user p").name){
                document.querySelector(".n_action_modal_bg .n_action_txt").textContent = "다른 사람의 워크플로우를 조작할 수 없습니다."
                document.getElementsByClassName("n_action_modal_bg")[0].style.display = 'inline'
            }else {
                if (e.target.parentNode.previousElementSibling.querySelector('button').value.includes('N')) {
                    if (e.target.alt === 'play') {
                        e.target.src = '/common/images/workflow/stop.svg'
                        e.target.alt = 'stop'
                        run_start(e.target.title)
                    } else {
                        e.target.src = '/common/images/workflow/play.svg'
                        e.target.alt = 'play'
                        run_stop(e.target.title)
                    }
                } else {
                    document.querySelector(".n_action_modal_bg .n_action_txt").textContent = "워크플로우 활성화 시 즉시 동작 기능을 사용할 수 없습니다."
                    document.getElementsByClassName("n_action_modal_bg")[0].style.display = 'inline'
                }
            }
        }
        
        // 워크플로우 이름 클릭시 수정 페이지로 이동
        if(e.target.className.includes("workflowName") && e.target.nodeName !== "TH"){
            location.href = 'workflow_change?id='+e.target.previousElementSibling.querySelector('input').value
        }
    })

    document.querySelector(".n_action_modal_bg").addEventListener("click",function(e){
        if(e.target.nodeName === 'IMG' || e.target.nodeName === 'BUTTON') {
            document.querySelector(".n_action_modal_bg").style.display = 'none'
        }
    })



    // 복사
    document.querySelector(".copy").addEventListener("click", function(e){
        document.getElementsByClassName('copy_modal_bg')[0].style.display='inline'
        let check = document.getElementsByName('check')
        let ids = []
        for (let i = 0; i < check.length; i++) {
            if (check[i].checked) ids.push(parseInt(check[i].value))
        }
        if(ids.length === 0) {
            document.getElementsByClassName('n_copy_modal')[0].style.display = 'inline'
        }
    })
    // 선택한 복사 모달창 x 버튼
    document.querySelector('.copy_modal_bg img').addEventListener('click',function(){
        document.getElementsByClassName('copy_modal_bg')[0].style.display='none'
    })
    // 선택한 복사 모달창 취소 버튼
    document.querySelectorAll('.copy_modal_bg button')[0].addEventListener('click',function(){
        document.getElementsByClassName('copy_modal_bg')[0].style.display='none'
    })
    // 선택한 복사 모달창 확인 버튼
    document.querySelectorAll('.copy_modal_bg button')[1].addEventListener('click',function(){
        let check = document.getElementsByName('check')
        let ids = []
        let loginIds = true
        for (let i = 0; i < check.length; i++) {
            if (check[i].checked) {
                if(check[i].parentNode.parentNode.querySelectorAll("td")[5].querySelector("p").id !== document.querySelector(".lnb_user p").name) loginIds = false
                ids.push(parseInt(check[i].value))
            }
        }

        $.ajax({
            url: 'workflow_copy',
            type: "POST",
            data: {ids: ids},
            success: function (data) {
                table.order(['1','asc']).draw();
                document.getElementsByClassName('copy_modal_bg')[0].style.display='none'
            },
            error: function (err) {
                console.log(err)
            }
        });

    })

    // 선택안된 복사 모달창 확인 버튼
    document.querySelector('.n_copy_modal button').addEventListener('click',function () {
        document.getElementsByClassName('n_copy_modal')[0].style.display = 'none'
        document.getElementsByClassName('copy_modal_bg')[0].style.display='none'
    })
    // 선택안된 복사 모달창 X 버튼
    document.querySelector('.n_copy_modal img').addEventListener('click',function () {
        document.getElementsByClassName('n_copy_modal')[0].style.display = 'none'
        document.getElementsByClassName('copy_modal_bg')[0].style.display='none'
    })





    // 삭제
    document.querySelector(".del").addEventListener("click", function(e){
        document.getElementsByClassName('delete_modal_bg')[0].style.display='inline'
        let check = document.getElementsByName('check')
        let ids = []
        for (let i = 0; i < check.length; i++) {
            if (check[i].checked) ids.push(parseInt(check[i].value))
        }
        if(ids.length === 0) {
            document.getElementsByClassName('n_delete_modal')[0].style.display = 'inline'
        }
    })
    // 선택한 삭제 모달창 x 버튼
    document.querySelector('.delete_modal_bg img').addEventListener('click',function(){
        document.getElementsByClassName('delete_modal_bg')[0].style.display='none'
    })
    // 선택한 삭제 모달창 취소 버튼
    document.querySelectorAll('.delete_modal_bg button')[0].addEventListener('click',function(){
        document.getElementsByClassName('delete_modal_bg')[0].style.display='none'
    })
    // 선택한 삭제 모달창 확인 버튼
    document.querySelectorAll('.delete_modal_bg button')[1].addEventListener('click',function(){
        let check = document.getElementsByName('check')
        let ids = []
        let loginIds = true
        for (let i = 0; i < check.length; i++) {
            if (check[i].checked) {
                if(check[i].parentNode.parentNode.querySelectorAll("td")[5].querySelector("p").id !== document.querySelector(".lnb_user p").name) loginIds = false
                ids.push(parseInt(check[i].value))
            }
        }

        if(!loginIds){
            document.getElementsByClassName('delete_modal_bg')[0].style.display='none'
            document.querySelector(".n_action_modal_bg .n_action_txt").textContent = "다른사람의 워크플로우를 삭제할 수 없습니다"
            document.getElementsByClassName("n_action_modal_bg")[0].style.display = 'inline'
        }else{
            $.ajax({
                url: 'workflow_delete',
                type: "POST",
                data: {ids: ids},
                success: function (data) {
                    table.order(['1','asc']).draw();
                    document.getElementsByClassName('delete_modal_bg')[0].style.display='none'
                },
                error: function (err) {
                    console.log(err)
                }
            });
        }

    })

    // 선택안된 삭제 모달창 확인 버튼
    document.querySelector('.n_delete_modal button').addEventListener('click',function () {
        document.getElementsByClassName('n_delete_modal')[0].style.display = 'none'
        document.getElementsByClassName('delete_modal_bg')[0].style.display='none'
    })
    // 선택안된 삭제 모달창 X 버튼
    document.querySelector('.n_delete_modal img').addEventListener('click',function () {
        document.getElementsByClassName('n_delete_modal')[0].style.display = 'none'
        document.getElementsByClassName('delete_modal_bg')[0].style.display='none'
    })



    // 전체 체크박스 확인
    document.querySelectorAll(".select").forEach(selectBoxElement => {
        selectBoxElement.addEventListener("click", function (e) {
            const targetElement = e.target;
            const isOptionElement = targetElement.classList.contains("option");

            if (isOptionElement) {
                const selectBox = targetElement.closest(".select");
                const selectedElement = selectBox.querySelector(".selected-value");
                selectedElement.textContent = targetElement.textContent;
                selectedElement.style.color='black'
            }

            selectBoxElement.classList.toggle("active");
        });
    });

    // 단일 체크박스 확인
    document.addEventListener("click", function (e) {
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

}






// 활성화 토글 버튼
$(document).on('click', '.activate_btn div', function () {
    if(this.parentNode.parentNode.querySelectorAll("td")[5].querySelector("p").id !== document.querySelector(".lnb_user p").name){
        document.querySelector(".n_action_modal_bg .n_action_txt").textContent = "다른 사람의 워크플로우를 조작할 수 없습니다."
        document.getElementsByClassName("n_action_modal_bg")[0].style.display = 'inline'
    }else {

        let toggleBG = $(this);
        let toggleFG = $(this).children('.activate_btn button');
        let left = toggleFG.css('left');

        if (left === '22px') {
            toggleBG.css('background', '#CCCCCC');
            toggleActionStart(toggleFG, 'TO_LEFT');
            toggleFG[0].value = toggleFG[0].value.split("_")[0] + "_N"
            actFlag_change(toggleFG[0].value)
        } else if (left === '2px') {
            toggleBG.css('background', '#378921');
            toggleActionStart(toggleFG, 'TO_RIGHT');
            toggleFG[0].value = toggleFG[0].value.split("_")[0] + "_Y"
            actFlag_change(toggleFG[0].value)
        }
    }
});

// 활성화 토글 버튼 이동 모션 함수
function toggleActionStart(toggleBtn, LR) {
    // 0.01초 단위로 실행
    let intervalID = setInterval(
        function() {
            // 버튼 이동
            let left = parseInt(toggleBtn.css('left'));
            left += (LR == 'TO_RIGHT') ? 5 : -5;
            if(left >= 2 && left <= 22) {
                left += 'px';
                toggleBtn.css('left', left);
            }
        }, 10);
    setTimeout(function(){
        clearInterval(intervalID);
    }, 201);
}
// 활성화 버튼 data 수정
function actFlag_change(value){

    let value_arr = value.split("_")
    $.ajax({
        url: 'workflow_flag',
        type: "POST",
        data: {id: value_arr[0], flag: value_arr[1]},
        success: function (data) {
        },
        error: function (err) {
            console.log(err)
        }
    });
}


function run_start(id){
    $.ajax({
        url: 'workflow_run',
        type: "POST",
        data: {id: id},
        success: function (data) {
        },
        error: function (err) {
            console.log(err)
        }
    });
}

function run_stop(id){
    $.ajax({
        url: 'workflow_stop',
        type: "POST",
        data: {id: id},
        success: function (data) {
        },
        error: function (err) {
            console.log(err)
        }
    });
}