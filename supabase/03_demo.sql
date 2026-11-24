-- One-click demo: seeds a sample workspace for the signed-in user.
-- Requires "Allow anonymous sign-ins" to be turned on in Supabase Auth.

create or replace function public.seed_demo_workspace()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_customers uuid;
  v_employees uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  -- Stop two calls at once from seeding twice
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));

  -- Only seed an empty workspace
  if exists (select 1 from public.datasets where user_id = auth.uid()) then
    return;
  end if;

  -- Dataset 1: customers
  insert into public.datasets (name, column_names, row_data, row_count, created_at)
  values (
    'customers.csv',
    '["id","name","email","age","country"]',
    '[
      {"id":"1","name":"Aiko Tanaka","email":"aiko@example.com","age":"29","country":"Japan"},
      {"id":"2","name":"Ben Clarke","email":"","age":"34","country":"Australia"},
      {"id":"3","name":"Chloe Kim","email":"chloe@example","age":"41","country":"Korea"},
      {"id":"3","name":"Dan Wu","email":"dan@example.com","age":"-5","country":""},
      {"id":"5","name":"","email":"eve@example.com","age":"220","country":"Japan"}
    ]',
    5,
    now() - interval '30 days'
  )
  returning id into v_customers;

  insert into public.rules (dataset_id, type, column_name, params, created_at) values
    (v_customers, 'unique', 'id', '{}', now() - interval '30 days'),
    (v_customers, 'not_empty', 'name', '{}', now() - interval '30 days' + interval '1 second'),
    (v_customers, 'email', 'email', '{}', now() - interval '30 days' + interval '2 seconds'),
    (v_customers, 'range', 'age', '{"min":0,"max":120}', now() - interval '30 days' + interval '3 seconds');

  insert into public.check_runs (dataset_id, score, clean_rows, total_rows, rule_count, rule_results, created_at)
  values (v_customers, 40, 2, 5, 4, '[]', now() - interval '29 days');

  -- Dataset 2: employees, improving over four weeks
  insert into public.datasets (name, column_names, row_data, row_count, created_at)
  values (
    'employees.csv',
    '["employee_id","full_name","work_email","department","salary","start_date"]',
    '[
      {"employee_id":"E001","full_name":"Aiko Tanaka","work_email":"aiko.tanaka@acme.co","department":"Engineering","salary":"95000","start_date":"2023-04-01"},
      {"employee_id":"E002","full_name":"Ben Clarke","work_email":"ben.clarke@acme.co","department":"Sales","salary":"72000","start_date":"2022-11-15"},
      {"employee_id":"E003","full_name":"Chloe Kim","work_email":"chloe.kim@acme.co","department":"Marketing","salary":"68000","start_date":"2024-01-08"},
      {"employee_id":"E004","full_name":"Daniel Wu","work_email":"daniel.wu@acme.co","department":"Engineering","salary":"88000","start_date":"2021-06-21"},
      {"employee_id":"E005","full_name":"","work_email":"eve.santos@acme.co","department":"HR","salary":"61000","start_date":"2023-09-04"},
      {"employee_id":"E006","full_name":"Farid Rahman","work_email":"farid.rahman@acme.co","department":"Engineering","salary":"120000","start_date":"2020-02-17"},
      {"employee_id":"E007","full_name":"Grace Lee","work_email":"grace.lee@acme.co","department":"Sales","salary":"58000","start_date":"2025-03-10"},
      {"employee_id":"E008","full_name":"Hiro Sato","work_email":"hiro.sato@acme.co","department":"Finance","salary":"83000","start_date":"2022-07-01"},
      {"employee_id":"E009","full_name":"Isla Brown","work_email":"isla.brownacme.co","department":"HR","salary":"66000","start_date":"2024-09-16"},
      {"employee_id":"E010","full_name":"Jack O''Neil","work_email":"jack.oneil@acme.co","department":"Engineering","salary":"-4000","start_date":"2024-05-20"},
      {"employee_id":"E011","full_name":"Kenji Mori","work_email":"kenji.mori@acme.co","department":"Marketing","salary":"seventy thousand","start_date":"2023-12-01"},
      {"employee_id":"E012","full_name":"Lina Haddad","work_email":"","department":"Finance","salary":"77000","start_date":"2021-10-11"},
      {"employee_id":"E013","full_name":"Mateo Garcia","work_email":"mateo.garcia@acme.co","department":"Sales","salary":"64000","start_date":"2027-01-15"},
      {"employee_id":"E014","full_name":"Nora Fischer","work_email":"nora.fischer@acme.co","department":"engineering","salary":"91000","start_date":"2022-03-28"},
      {"employee_id":"E015","full_name":"Nguyen, Oscar","work_email":"oscar.nguyen@acme.co","department":"Operations","salary":"70000","start_date":"2020-08-30"}
    ]',
    15,
    now() - interval '28 days'
  )
  returning id into v_employees;

  insert into public.rules (dataset_id, type, column_name, params, created_at) values
    (v_employees, 'unique', 'employee_id', '{}', now() - interval '28 days'),
    (v_employees, 'not_empty', 'full_name', '{}', now() - interval '28 days' + interval '1 second'),
    (v_employees, 'not_empty', 'work_email', '{}', now() - interval '28 days' + interval '2 seconds'),
    (v_employees, 'email', 'work_email', '{}', now() - interval '28 days' + interval '3 seconds'),
    (v_employees, 'not_empty', 'salary', '{}', now() - interval '28 days' + interval '4 seconds'),
    (v_employees, 'range', 'salary', '{"min":30000,"max":300000}', now() - interval '28 days' + interval '5 seconds');

  insert into public.check_runs (dataset_id, score, clean_rows, total_rows, rule_count, rule_results, created_at) values
    (v_employees, 40, 6, 15, 6, '[]', now() - interval '28 days'),
    (v_employees, 47, 7, 15, 6, '[]', now() - interval '21 days'),
    (v_employees, 53, 8, 15, 6, '[]', now() - interval '14 days'),
    (v_employees, 67, 10, 15, 6, '[
      {"description":"employee_id is unique","failures":0},
      {"description":"full_name is never empty","failures":1},
      {"description":"work_email is never empty","failures":1},
      {"description":"work_email is a valid email","failures":1},
      {"description":"salary is never empty","failures":0},
      {"description":"salary is between 30000 and 300000","failures":2}
    ]', now() - interval '2 days');
end;
$$;

revoke execute on function public.seed_demo_workspace() from public, anon;
grant execute on function public.seed_demo_workspace() to authenticated;
