#ifndef NU_CORE_H
#define NU_CORE_H
#define NU_CORE_VERSION "0.1.0-foundation"
#define NU_MAX_TASKS 32
#define NU_TASK_NAME_MAX 31

typedef struct NU_Capabilities {
    unsigned long physical_ram_mb;
    unsigned int logical_processors;
    unsigned int cpu_confidence;
    unsigned int ram_confidence;
    unsigned int gpu_known;
} NU_Capabilities;

typedef struct NU_Budget {
    unsigned long ram_ceiling_mb;
    unsigned long ram_stable_mb;
    unsigned int cpu_stable_percent;
    unsigned int worker_limit;
    unsigned int gpu_known;
} NU_Budget;

typedef struct NU_Task {
    unsigned long id;
    char name[NU_TASK_NAME_MAX + 1];
    unsigned int class_id;
    unsigned int state;
} NU_Task;

typedef struct NU_Scheduler {
    NU_Task tasks[NU_MAX_TASKS];
    unsigned int count;
    unsigned int cursor;
    unsigned int host_turn;
    unsigned long next_id;
} NU_Scheduler;

enum {
    NU_TASK_CLASS_HOST = 0,
    NU_TASK_CLASS_TRANSLATE = 1,
    NU_TASK_CLASS_RENDER = 2,
    NU_TASK_CLASS_IO = 3,
    NU_TASK_CLASS_GAME = 4
};
enum {
    NU_TASK_EMPTY = 0,
    NU_TASK_READY = 1,
    NU_TASK_RUNNING = 2,
    NU_TASK_DONE = 3,
    NU_TASK_FAILED = 4
};

void nu_calibrate(const NU_Capabilities *caps, NU_Budget *budget);
void nu_scheduler_init(NU_Scheduler *scheduler);
int nu_scheduler_submit(NU_Scheduler *scheduler, const char *name,
                        unsigned int class_id, unsigned long *task_id);
int nu_scheduler_next(NU_Scheduler *scheduler, NU_Task *task);
int nu_scheduler_complete(NU_Scheduler *scheduler, unsigned long task_id,
                          int success);
unsigned int nu_scheduler_pending(const NU_Scheduler *scheduler);
#endif
