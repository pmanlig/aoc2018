#include <stdio.h>

int input[1300][5], num=0, fab[1024][1024], conflict = 0;

void init()
{
    for (int i = 0; i < 1024; i++)
        for (int j = 0; j < 1024; j++)
            fab[i][j] = 0;
    char b;
    while (!feof(stdin))
    {
        scanf("%c%d %c %d%c%d%c %d%c%d ", &b, &input[num][0], &b, &input[num][1], &b, &input[num][2], &b, &input[num][3], &b, &input[num][4]);
        printf("%d %d %d %d %d\n", input[num][0], input[num][1], input[num][2], input[num][3], input[num][4]);
        num++;
    }
}

void allocate()
{
    for (int p = 0; p < num; p++) {
        int *b = input[p];
        for (int i = b[1]; i < b[1] + b[3]; i++)
            for (int j = b[2]; j < b[2] + b[4]; j++)
                fab[i][j]++;
    }
}

int findAnswer()
{
    for (int p = 0; p < num; p++)
    {
        int m=1;
        int *b = input[p];
        for (int i = b[1]; i < b[1] + b[3]; i++)
            for (int j = b[2]; j < b[2] + b[4]; j++)
                if (fab[i][j] != 1)
                        m = 0;
        if (m) return input[p][0];
    }
    return 0;
}

void printConflict() {
    for (int i = 0; i < 1024; i++)
        for (int j = 0; j < 1024; j++)
            if (fab[i][j] > 1)
                conflict++;
    printf("Conflicts: %d\n", conflict);
}

void main()
{
    init();
    allocate();
    printConflict();
    printf("Uncontested: %d\n", findAnswer());
}