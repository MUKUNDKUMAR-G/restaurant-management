use sushixx;

-- index trên bills
explain analyze
select o.created_at, sum(b.total_amount_with_benefits)
from orders o
left join bills b on o.order_id = b.order_id
where (o.created_at between '2025-12-1' and '2025-12-27') 
and o.branch_id = 1 and b.status = 'paid'
group by o.created_at;

-- index trong menu và dishes
CREATE INDEX idx_dishes_price ON dishes (price);
CREATE INDEX idx_dishes_category_name_dish_name ON dishes (category_name, dish_name);
CREATE INDEX idx_menu_branch_dish ON menu (branch_id, dish_id);


explain analyze
select d.dish_name, d.price
from menu m
join dishes d on d.dish_id = m.dish_id
where  m.branch_id = 1 and m.is_serve = true 
and d.dish_name like '%sushi' and d.category_name = 'Sashimi combo'
order by d.price;

-- index trên online_account
CREATE INDEX idx_user_email ON online_account(user_email);
drop INDEX idx_user_email ON online_account;
select * from online_account;
explain analyze
select * 
from online_account
where user_email = 'kirsten58@example.org';

-- index trên reservation_slips
CREATE INDEX idx_reservation_slips_arrival_date 
ON reservation_slips (arrival_date);
explain analyze
select *
from reservation_slips
where arrival_date = '2024-12-15';




