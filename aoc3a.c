#include <stdio.h>

void main() {
    int fab[1024][1024], conflict=0;
    char b;
    int id, x, y, w, h, maxx=0, maxy=0;
    for (int i=0; i<1024;i++)
        for (int j=0; j<1024;j++)
            fab[i][j]=0;
    while (!feof(stdin)) {
        if (scanf("%c%d %c %d%c%d%c %d%c%d ", &b, &id, &b, &x, &b, &y, &b, &w, &b, &h) > 0) printf("%d %d %d %d %d\n", id, x, y, w, h);
        for (int i=x; i<x+w; i++)
            for (int j=y;j<y+h; j++)
                fab[i][j]++;
        // if (maxx < x+w) maxx=x+w;
        // if (maxy < y+h) maxy=y+h;
    }
    for (int i=0; i<1024;i++)
        for (int j=0; j<1024;j++)
            if (fab[i][j]>1) conflict++;
    // printf("Max size: %dx%d\n", maxx, maxy);
    printf("Conflicts: %d\n", conflict);
}