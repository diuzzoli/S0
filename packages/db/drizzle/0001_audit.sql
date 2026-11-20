-- Auditoría por triggers: cada INSERT/UPDATE/DELETE en una tabla habilitada
-- queda en audit_log con el actor seteado por withActor() (set_config('app.actor_id')).

CREATE OR REPLACE FUNCTION audit_log_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  rec_id text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    rec_id := OLD.id::text;
  ELSE
    rec_id := NEW.id::text;
  END IF;

  INSERT INTO audit_log (table_name, record_id, operation, actor_id, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    rec_id,
    TG_OP,
    NULLIF(current_setting('app.actor_id', true), ''),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN NULL;
END;
$$;
--> statement-breakpoint

-- Habilita la auditoría en una tabla: select audit_enable('mi_tabla');
CREATE OR REPLACE FUNCTION audit_enable(target regclass) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON %s', target);
  EXECUTE format(
    'CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON %s
     FOR EACH ROW EXECUTE FUNCTION audit_log_change()', target);
END;
$$;
--> statement-breakpoint

-- audit_log es append-only: se bloquean UPDATE y DELETE a nivel base de datos.
CREATE OR REPLACE FUNCTION audit_log_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log es append-only';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER audit_log_no_update BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
--> statement-breakpoint

-- Tablas auditadas desde el inicio.
SELECT audit_enable('note');
--> statement-breakpoint
SELECT audit_enable('"user"');
