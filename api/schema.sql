create table websites (
    id serial primary key,
    timestamp timestamp not null default now(),
    url text not null,
    status int default 0
);

create table checks (
    id serial primary key,
    timestamp timestamp not null default now(),
    website_id integer references websites (id),
    status integer not null,
    latency integer not null
);