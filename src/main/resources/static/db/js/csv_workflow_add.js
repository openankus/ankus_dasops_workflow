function workflow_add(){
    $.ajax({
        type: 'POST',
        data: { "name": document.querySelectorAll(".data_name li")[2].textContent.replace(" : ","") },
        url: "dbInformation",
        success: function (data) {

            let workflow = {
                "name": data['name']+".csv",
                "actFlag": "N",
                "execCondType": "EVENT_LISTEN",
                "execCondHour": "",
                "execCondCronExp": "",
                "execCondDayList": [],
                "execCondExecStatusName": "export csv",
                "workflowStepList": [
                    {
                        "num": 1,
                        "moduleExecConfList": [
                            {
                                "num": 1,
                                "name": "csv다운",
                                "moduleFilePath": "/exportcsv.py",
                                "cmdArgList": [
                                    "dbtype : "+data['type'],
                                    "host : "+data['url'],
                                    "port : "+data['port'],
                                    "user : "+data['userid'],
                                    "pw : "+data['password'],
                                    "dbname : "+data['dbname'],
                                    "sql : "+newSqlSearchSetting["sql"],
                                    "file : "+data['name']+".csv"
                                ]
                            }
                        ]
                    }
                ]
            }
            export_csv(workflow)
        }, error: function (error) {
            console.log(error)
        }
    })
}

function export_csv(workflow){
    $.ajax({
        type: 'POST',
        url: "workflow_add",
        data: JSON.stringify(workflow),
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            $.ajax({
                url: 'workflow_run',
                type: "POST",
                data: {id: data},
                success: function (result) {

                },
                error: function (err) {
                    console.log(err)
                }
            });
        }, error: function (error) {
            console.log(error)
        }
    });
}