#include <stdio.h>
#include "nu_core.h"
int main(void)
{
    NU_Capabilities caps;
    NU_Budget budget;
    NU_Scheduler scheduler;
    NU_Task task;
    unsigned long host_id, game_id;
    caps.physical_ram_mb = 1024UL;
    caps.logical_processors = 2U;
    caps.cpu_confidence = 2U;
    caps.ram_confidence = 2U;
    caps.gpu_known = 0U;
    nu_calibrate(&caps, &budget);
    if (budget.ram_ceiling_mb != 512UL) return 1;
    if (budget.ram_stable_mb != 340UL) return 2;
    if (budget.worker_limit != 1U || budget.cpu_stable_percent != 33U) return 3;
    caps.ram_confidence = 0U;
    nu_calibrate(&caps, &budget);
    if (budget.ram_stable_mb != 0UL) return 4;
    nu_scheduler_init(&scheduler);
    if (!nu_scheduler_submit(&scheduler, "host-input", NU_TASK_CLASS_HOST, &host_id)) return 5;
    if (!nu_scheduler_submit(&scheduler, "game-step", NU_TASK_CLASS_GAME, &game_id)) return 6;
    if (!nu_scheduler_next(&scheduler, &task) || task.id != host_id) return 7;
    if (!nu_scheduler_complete(&scheduler, task.id, 1)) return 8;
    if (!nu_scheduler_next(&scheduler, &task) || task.id != game_id) return 9;
    if (!nu_scheduler_complete(&scheduler, task.id, 1)) return 10;
    if (nu_scheduler_pending(&scheduler) != 0U) return 11;
    puts("N.U core smoke test: PASS");
    return 0;
}
