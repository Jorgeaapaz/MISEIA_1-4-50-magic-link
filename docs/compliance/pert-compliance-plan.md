# PERT Compliance Plan — Magik Link (1-4-50)
**Fecha:** 2026-06-25  
**Alumno:** jorgeaapaz@hotmail.com

---

## PERT Compliance Plan

Las tareas están organizadas en orden lógico de dependencias. Las tareas sin dependencias pueden ejecutarse en paralelo. Las que tienen `deps:` deben esperar a que sus dependencias estén completadas.

```
[001] .env.example ──────────────────────────────────────────────────┐
[002] Tests unitarios/integración ──► [003] Coverage report          │
                                   └─► [004] GitLab CI (test+lint)   │
[007] Dockerfile + Deploy instrucciones ──► [005] GitHub CI/CD + VM  ┘──► fn_deploy_publico_accesible
[006] Diagrama de arquitectura (independiente)
[008] ADRs (independiente)
[009] Justificación cuantitativa (independiente)
```

### Nodos PERT

| ID | Tarea | Deps | Prompt |
|---|---|---|---|
| T1 | Crear `.env.example` | — | [`[001]_env_example_template_fn_prompt.md`](./[001]_env_example_template_fn_prompt.md) |
| T2 | Tests unitarios e integración | — | [`[002]_unit_integration_tests_fn_prompt.md`](./[002]_unit_integration_tests_fn_prompt.md) |
| T3 | Reporte de cobertura de tests | T2 | [`[003]_test_coverage_report_fn_prompt.md`](./[003]_test_coverage_report_fn_prompt.md) |
| T4 | GitLab CI con tests y linter | T2, T3 | [`[004]_gitlab_ci_tests_lint_fn_prompt.md`](./[004]_gitlab_ci_tests_lint_fn_prompt.md) |
| T5 | GitHub Actions + Deploy VM (FAVORECIDA) | T7 | [`[005]_github_ci_deploy_vm_fn_prompt.md`](./[005]_github_ci_deploy_vm_fn_prompt.md) |
| T6 | Diagrama de arquitectura | — | [`[006]_architecture_diagram_fn_prompt.md`](./[006]_architecture_diagram_fn_prompt.md) |
| T7 | Dockerfile + instrucciones de deploy | — | [`[007]_dockerfile_deploy_instructions_fn_prompt.md`](./[007]_dockerfile_deploy_instructions_fn_prompt.md) |
| T8 | ADRs / Decision Log | — | [`[008]_adrs_decision_log_fn_prompt.md`](./[008]_adrs_decision_log_fn_prompt.md) |
| T9 | Justificación cuantitativa | — | [`[009]_quantitative_justification_fn_prompt.md`](./[009]_quantitative_justification_fn_prompt.md) |

---

## Proper Execution of Tasks

Las siguientes tareas deben ejecutarse en el orden indicado. Las tareas sin dependencias en el mismo nivel pueden ejecutarse en paralelo.

1. **T1** — Crear `.env.example` con todas las variables de entorno requeridas sin valores reales.  
   _Prompt:_ `[001]_env_example_template_fn_prompt.md`

2. **T2** — Implementar tests unitarios e integración (jest/vitest) para los flujos críticos de auth.  
   _Prompt:_ `[002]_unit_integration_tests_fn_prompt.md`

3. **T6** — Añadir diagrama de arquitectura Mermaid al README.  
   _Prompt:_ `[006]_architecture_diagram_fn_prompt.md`  
   _(puede ejecutarse en paralelo con T2)_

4. **T7** — Crear Dockerfile multistage y añadir sección de deploy al README.  
   _Prompt:_ `[007]_dockerfile_deploy_instructions_fn_prompt.md`  
   _(puede ejecutarse en paralelo con T2, T6)_

5. **T8** — Escribir ADRs para las decisiones arquitectónicas clave.  
   _Prompt:_ `[008]_adrs_decision_log_fn_prompt.md`  
   _(puede ejecutarse en paralelo con T2, T6, T7)_

6. **T9** — Añadir justificación cuantitativa a las decisiones técnicas.  
   _Prompt:_ `[009]_quantitative_justification_fn_prompt.md`  
   _(puede ejecutarse en paralelo con T2, T6, T7, T8)_

7. **T3** — Configurar reporte de cobertura de tests (requiere T2 completo).  
   _Prompt:_ `[003]_test_coverage_report_fn_prompt.md`

8. **T5** — Crear GitHub Actions CI/CD que despliega la app en la VM de GCloud (requiere T7 completo, favorecida sobre T4).  
   _Prompt:_ `[005]_github_ci_deploy_vm_fn_prompt.md`

9. **T4** — Actualizar `.gitlab-ci.yml` para incluir tests y linter (requiere T2, T3 completos).  
   _Prompt:_ `[004]_gitlab_ci_tests_lint_fn_prompt.md`

