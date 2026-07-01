-- Update payment_due view to show the due month as the previous month
-- And calculate CUMULATIVE outstanding dues across all months since enrollment.

CREATE OR REPLACE VIEW payment_due AS
WITH due_calculations AS (
  SELECT
    p.id AS student_id,
    p.full_name,
    p.phone,
    e.batch_id,
    b.name AS batch_name,
    b.fee AS monthly_fee,
    to_char(now() - interval '1 month', 'FMMonth YYYY'::text) AS due_month,
    -- Calculate due months count from enrolled_at to previous month
    COALESCE((
      SELECT count(*)::numeric
      FROM generate_series(
        date_trunc('month', e.enrolled_at),
        date_trunc('month', now() - interval '1 month'),
        interval '1 month'
      )
    ), 0) * b.fee AS total_fee_due,
    -- Total paid for all generated due months
    COALESCE((
      SELECT sum(pay.amount)
      FROM payments pay
      WHERE pay.student_id = p.id
        AND pay.month IN (
          SELECT to_char(m, 'FMMonth YYYY')
          FROM generate_series(
            date_trunc('month', e.enrolled_at),
            date_trunc('month', now() - interval '1 month'),
            interval '1 month'
          ) AS m
        )
    ), 0) AS total_paid
  FROM profiles p
  JOIN enrollments e ON e.student_id = p.id AND e.status = 'active'
  JOIN batches b ON b.id = e.batch_id
)
SELECT
  student_id,
  full_name,
  phone,
  batch_id,
  batch_name,
  monthly_fee,
  due_month,
  total_paid AS paid_this_month,
  (total_fee_due - total_paid) AS outstanding,
  CASE
    WHEN (total_fee_due - total_paid) <= 0 THEN 'paid'::text
    WHEN total_paid <= 0 THEN 'overdue'::text
    ELSE 'partial'::text
  END AS status
FROM due_calculations;
