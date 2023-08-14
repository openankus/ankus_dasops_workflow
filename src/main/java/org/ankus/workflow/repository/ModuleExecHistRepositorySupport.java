package org.ankus.workflow.repository;

import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.ankus.workflow.model.ModuleExecHist;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

import static org.ankus.workflow.model.QModuleExecHist.moduleExecHist;
import static org.ankus.workflow.model.QWorkflowExecHist.workflowExecHist;
import static org.ankus.workflow.model.QWorkflowStepExecHist.workflowStepExecHist;


@Repository
public class ModuleExecHistRepositorySupport extends QuerydslRepositorySupport {
    private final JPAQueryFactory jpaQueryFactory;

    /**
     * Creates a new {@link QuerydslRepositorySupport} instance for the given domain type.
     * @param jpaQueryFactory
     */
    public ModuleExecHistRepositorySupport(JPAQueryFactory jpaQueryFactory) {
        super(ModuleExecHist.class);
        this.jpaQueryFactory = jpaQueryFactory;
    }

    public List<ModuleExecHist> moduleExecHistSelect(long id,String column, String sort){
        return jpaQueryFactory
                .selectFrom(moduleExecHist)
                .leftJoin(workflowStepExecHist).on(moduleExecHist.workflowStepExecHist.id.eq(workflowStepExecHist.id))
                .leftJoin(workflowExecHist).on(workflowStepExecHist.workflowExecHist.id.eq(workflowExecHist.id))
                .where(
                        workflowExecHist.id.eq(id)
                )
                .orderBy(
                        getOrderSpecifierHist(column,sort)
                                .stream().toArray(OrderSpecifier[]::new)
                ).fetch();
    }

    public static OrderSpecifier<?> getSortedColumn(Order order, Path<?> parent, String fieldName) {
        Path<Object> fieldPath = Expressions.path(Object.class, parent, fieldName);
        return new OrderSpecifier(order, fieldPath);
    }

    private List<OrderSpecifier> getOrderSpecifierHist(String column,String sort) {
        List<OrderSpecifier> orders = new ArrayList<>();
        // Sort
        Order direction = sort.equals("asc") ? Order.ASC : Order.DESC;
        switch (column) {
            case "startDateTime":
                OrderSpecifier<?> orderName = getSortedColumn(direction, moduleExecHist, "startDateTime");
                orders.add(orderName);
                break;
            case "endDateTime":
                OrderSpecifier<?> orderCreateUser = getSortedColumn(direction, moduleExecHist, "endDateTime");
                orders.add(orderCreateUser);
                break;
            case "name":
                OrderSpecifier<?> orderUpdateDateTime = getSortedColumn(direction, moduleExecHist, "name");
                orders.add(orderUpdateDateTime);
                break;
            default:
                break;
        }

        return orders;
    }
}
