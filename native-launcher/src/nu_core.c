#include "nu_core.h"
#include <string.h>

void nu_calibrate(const NU_Capabilities *caps, NU_Budget *budget)
{
    unsigned long half_ram;
    if (caps == 0 || budget == 0) return;
    half_ram = caps->physical_ram_mb / 2UL;
    budget->ram_ceiling_mb = half_ram;
    budget->ram_stable_mb = (half_ram / 3UL) * 2UL;
    budget->cpu_stable_percent = 33U;
    budget->worker_limit = 1U;
    budget->gpu_known = caps->gpu_known ? 1U : 0U;
    if (caps->ram_confidence < 2U) budget->ram_stable_mb = 0UL;
    if (caps->logical_processors == 0U || caps->cpu_confidence < 2U)
        budget->cpu_stable_percent = 10U;
}

void nu_scheduler_init(NU_Scheduler *scheduler)
{
    if (scheduler == 0) return;
    memset(scheduler, 0, sizeof(*scheduler));
    scheduler->next_id = 1UL;
    scheduler->host_turn = 1U;
}

int nu_scheduler_submit(NU_Scheduler *scheduler, const char *name,
                        unsigned int class_id, unsigned long *task_id)
{
    NU_Task *task;
    unsigned int i, length;
    if (scheduler == 0 || name == 0 || scheduler->count >= NU_MAX_TASKS)
        return 0;
    length = (unsigned int)strlen(name);
    if (length == 0U || length > NU_TASK_NAME_MAX ||
        class_id > NU_TASK_CLASS_GAME) return 0;
    for (i = 0U; i < scheduler->count; ++i) {
        if (scheduler->tasks[i].state == NU_TASK_READY ||
            scheduler->tasks[i].state == NU_TASK_RUNNING) {
            if (strcmp(scheduler->tasks[i].name, name) == 0) return 0;
        }
    }
    task = &scheduler->tasks[scheduler->count++];
    memset(task, 0, sizeof(*task));
    task->id = scheduler->next_id++;
    strcpy(task->name, name);
    task->class_id = class_id;
    task->state = NU_TASK_READY;
    if (task_id != 0) *task_id = task->id;
    return 1;
}

int nu_scheduler_next(NU_Scheduler *scheduler, NU_Task *task)
{
    unsigned int offset, index, want_host;
    if (scheduler == 0 || task == 0) return 0;
    want_host = scheduler->host_turn;
    for (offset = 0U; offset < scheduler->count; ++offset) {
        index = (scheduler->cursor + offset) % scheduler->count;
        if (scheduler->tasks[index].state != NU_TASK_READY) continue;
        if ((scheduler->tasks[index].class_id == NU_TASK_CLASS_HOST) !=
            (want_host != 0U)) continue;
        scheduler->tasks[index].state = NU_TASK_RUNNING;
        scheduler->cursor = (index + 1U) % scheduler->count;
        scheduler->host_turn = want_host ? 0U : 1U;
        *task = scheduler->tasks[index];
        return 1;
    }
    scheduler->host_turn = want_host ? 0U : 1U;
    for (offset = 0U; offset < scheduler->count; ++offset) {
        index = (scheduler->cursor + offset) % scheduler->count;
        if (scheduler->tasks[index].state != NU_TASK_READY) continue;
        scheduler->tasks[index].state = NU_TASK_RUNNING;
        scheduler->cursor = (index + 1U) % scheduler->count;
        scheduler->host_turn =
            scheduler->tasks[index].class_id == NU_TASK_CLASS_HOST ? 0U : 1U;
        *task = scheduler->tasks[index];
        return 1;
    }
    return 0;
}

int nu_scheduler_complete(NU_Scheduler *scheduler, unsigned long task_id,
                          int success)
{
    unsigned int i;
    if (scheduler == 0 || task_id == 0UL) return 0;
    for (i = 0U; i < scheduler->count; ++i) {
        if (scheduler->tasks[i].id == task_id &&
            scheduler->tasks[i].state == NU_TASK_RUNNING) {
            scheduler->tasks[i].state = success ? NU_TASK_DONE : NU_TASK_FAILED;
            return 1;
        }
    }
    return 0;
}

unsigned int nu_scheduler_pending(const NU_Scheduler *scheduler)
{
    unsigned int i, pending = 0U;
    if (scheduler == 0) return 0U;
    for (i = 0U; i < scheduler->count; ++i)
        if (scheduler->tasks[i].state == NU_TASK_READY ||
            scheduler->tasks[i].state == NU_TASK_RUNNING) ++pending;
    return pending;
}
