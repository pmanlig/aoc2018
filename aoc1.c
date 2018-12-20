#include <stdio.h>

void main() {
    long freq = 0, offset;
    while(!feof(stdin)) {
        if (scanf("%ld", &offset) > 0)
            freq += offset;
    }
    printf("%ld\n", freq);
}