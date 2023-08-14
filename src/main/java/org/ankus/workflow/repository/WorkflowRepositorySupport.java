package org.ankus.workflow.repository;

import com.querydsl.core.QueryResults;
import com.querydsl.core.types.*;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.ankus.workflow.model.ModuleExecHist;
import org.ankus.workflow.model.Workflow;
import org.ankus.workflow.model.WorkflowExecHist;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static com.querydsl.core.group.GroupBy.groupBy;
import static org.ankus.workflow.model.QWorkflow.workflow;
import static org.ankus.workflow.model.QWorkflowExecHist.workflowExecHist;

@Repository
public class WorkflowRepositorySupport extends QuerydslRepositorySupport {
    private final JPAQueryFactory jpaQueryFactory;

    /**
     * Creates a new {@link QuerydslRepositorySupport} instance for the given domain type.
     * @param jpaQueryFactory
     */
    public WorkflowRepositorySupport(JPAQueryFactory jpaQueryFactory) {
        super(ModuleExecHist.class);
        this.jpaQueryFactory = jpaQueryFactory;
    }

    public PageImpl list(int start, int length, String column, String sort, String state, String text, String udate){
        QueryResults<Workflow> queryResult = jpaQueryFactory
                .selectFrom(workflow)
                .where(
                        workflow.updateDateTime.between(
                                LocalDate.parse(udate.split(" ")[0], DateTimeFormatter.ISO_DATE).atTime(0,0),
                                LocalDate.parse(udate.split(" ")[1], DateTimeFormatter.ISO_DATE).atTime(23,59)
                        ),
                        workflowCuser(state, text),
                        workflowName(state, text)
                )
                .orderBy(
                        getOrderSpecifier(column,sort)
                                .stream().toArray(OrderSpecifier[]::new)
                )
                .offset(start)
                .limit(length)
                .fetchResults();
        List<Workflow> content = queryResult.getResults();
        return new PageImpl(content);
    }
    public long total(String state, String text, String udate) {
        return jpaQueryFactory
                .selectFrom(workflow)
                .where(
                        workflow.updateDateTime.between(
                                LocalDate.parse(udate.split(" ")[0], DateTimeFormatter.ISO_DATE).atTime(0,0),
                                LocalDate.parse(udate.split(" ")[1], DateTimeFormatter.ISO_DATE).atTime(23,59)
                        ),
                        workflowCuser(state, text),
                        workflowName(state, text)
                )
                .fetchCount();
    }

    private BooleanExpression workflowCuser(String type, String keyword) {
        if(type != null) return type.equals("createUser") ? workflow.createUser.contains(keyword) : null;
        else return null;
    }

    private BooleanExpression workflowName(String type, String keyword) {
        if(type != null) return type.equals("name") ? workflow.name.contains(keyword) : null;
        else return null;
    }

    private List<OrderSpecifier> getOrderSpecifier(String column,String sort) {
        List<OrderSpecifier> orders = new ArrayList<>();
        // Sort
        Order direction = sort.equals("asc") ? Order.ASC : Order.DESC;
        switch (column) {
            case "name":
                OrderSpecifier<?> orderName = getSortedColumn(direction, workflow, "name");
                orders.add(orderName);
                break;
            case "createUser":
                OrderSpecifier<?> orderCreateUser = getSortedColumn(direction, workflow, "createUser");
                orders.add(orderCreateUser);
                break;
            case "updateDateTime":
                OrderSpecifier<?> orderUpdateDateTime = getSortedColumn(direction, workflow, "updateDateTime");
                orders.add(orderUpdateDateTime);
                break;
            default:
                break;
        }

        return orders;
    }

    public static OrderSpecifier<?> getSortedColumn(Order order, Path<?> parent, String fieldName) {
        Path<Object> fieldPath = Expressions.path(Object.class, parent, fieldName);
        return new OrderSpecifier(order, fieldPath);
    }


    public PageImpl workflowExecHistList(long id, int start, int length, String column, String sort){

        QueryResults<WorkflowExecHist> queryResult = jpaQueryFactory
                .selectFrom(workflowExecHist)
                .where(
                        workflowExecHist.workflow.id.eq(id)
                )
                .orderBy(
                        getOrderSpecifierHist(column,sort)
                                .stream().toArray(OrderSpecifier[]::new)
                )
                .offset(start)
                .limit(length)
                .fetchResults();
        List<WorkflowExecHist> content = queryResult.getResults();
        return new PageImpl(content);
    }

    public long workflowExecHistListTotal(long id) {
        return jpaQueryFactory
                .selectFrom(workflowExecHist)
                .where(
                        workflowExecHist.workflow.id.eq(id)
                )
                .fetchCount();
    }

    private List<OrderSpecifier> getOrderSpecifierHist(String column,String sort) {
        List<OrderSpecifier> orders = new ArrayList<>();
        // Sort
        Order direction = sort.equals("asc") ? Order.ASC : Order.DESC;
        switch (column) {
            case "startDateTime":
                OrderSpecifier<?> orderName = getSortedColumn(direction, workflowExecHist, "startDateTime");
                orders.add(orderName);
                break;
            case "endDateTime":
                OrderSpecifier<?> orderCreateUser = getSortedColumn(direction, workflowExecHist, "endDateTime");
                orders.add(orderCreateUser);
                break;
            case "execStat":
                OrderSpecifier<?> orderUpdateDateTime = getSortedColumn(direction, workflowExecHist, "execStat");
                orders.add(orderUpdateDateTime);
                break;
            default:
                break;
        }

        return orders;
    }
}
