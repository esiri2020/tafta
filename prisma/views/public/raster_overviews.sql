SELECT
  current_database() AS o_table_catalog,
  n.nspname AS o_table_schema,
  c.relname AS o_table_name,
  a.attname AS o_raster_column,
  current_database() AS r_table_catalog,
  (
    split_part(
      split_part(s.consrc, '''::name' :: text, 1),
      '''' :: text,
      2
    )
  ) :: name AS r_table_schema,
  (
    split_part(
      split_part(s.consrc, '''::name' :: text, 2),
      '''' :: text,
      2
    )
  ) :: name AS r_table_name,
  (
    split_part(
      split_part(s.consrc, '''::name' :: text, 3),
      '''' :: text,
      2
    )
  ) :: name AS r_raster_column,
  (btrim(split_part(s.consrc, ',' :: text, 2))) :: integer AS overview_factor
FROM
  pg_class c,
  pg_attribute a,
  pg_type t,
  pg_namespace n,
  pg_constraint s
WHERE
  (
    (t.typname = 'raster' :: name)
    AND (a.attisdropped = false)
    AND (a.atttypid = t.oid)
    AND (a.attrelid = c.oid)
    AND (c.relnamespace = n.oid)
    AND (
      (c.relkind) :: text = ANY (
        (
          ARRAY ['r'::character(1), 'v'::character(1), 'm'::character(1), 'f'::character(1)]
        ) :: text []
      )
    )
    AND (s.connamespace = n.oid)
    AND (s.conrelid = c.oid)
    AND (s.consrc ~~ '%_overview_constraint(%' :: text)
    AND (NOT pg_is_other_temp_schema(c.relnamespace))
    AND has_table_privilege(c.oid, 'SELECT' :: text)
  );