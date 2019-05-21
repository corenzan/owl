create type website_status as enum ('unknown', 'up', 'maintenance', 'down');

create table websites (
	id serial not null primary key,
	url text not null,
	status website_status not null default 'unknown',
	updated_at timestamptz not null default current_timestamp 
);

create type check_result as enum ('up', 'down');

create table checks (
	id serial not null primary key,
	checked_at timestamptz not null default current_timestamp,
	website_id integer references websites (id),
	result check_result not null,
	latency jsonb not null default '{}'
);

create function percentage(n numeric, t numeric)
returns numeric as $$
	begin 
		return case when t = 0 then 0 else n / t * 100.0 end; 
	end;
$$ language plpgsql;