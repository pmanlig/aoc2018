#include <stdio.h>
#define TRUE 1
#define FALSE 0

char buf[100], b=0, p, q;
int count=0, ex=0;
char o[101][2];
char e[27];

int occurs(char a) {
    for (int i=0; i<count; i++)
        if (o[i][0]==a || o[i][1]==a) return TRUE;
    return FALSE;
}

void countChars() {
    for (char a='A'; a<'Z'+1; a++)
        if (occurs(a)) e[ex++] = a;
}

int exists(char a) {
    for (int i=0; i<ex; i++)
        if (e[i]==a) return TRUE;
    return FALSE;
}

void printDependency() {
    for (int i=0; i< count; i++) {
        printf("%c -> %c\n", o[i][0], o[i][1]);
    }
}

int remains() {
    return b < ex;
}

int canDo(char a) {
    for (int i=0; i < count; i++) {
        if (o[i][0]==a && o[i][1]!=0) return FALSE;
    }
    return TRUE;
}

int used(char a) {
    for (int i=0; i<b; i++)
        if (buf[i]==a) return TRUE;
    return FALSE;
}

char find() {
    for (char a='A'; a<'Z'+1;a++) {
        if (exists(a) && !used(a) && canDo(a))
            return a;
    }
    return 0;
}

void pick(char a) {
    printf("%d: %c\n", b, a);
    buf[b++] = a;
    for(int i=0; i<count; i++)
        if (o[i][1]==a) o[i][1]=0;
}

void main() {
    while (!feof(stdin)) {
        scanf("%s %c %s %s %s %s %s %c ", buf, &o[count][1], buf, buf, buf, buf, buf, &o[count][0]);
        b=0;
        while (!feof(stdin) && b!='\n') b=getchar();
        count++;
    }
    printf("%d rows\n", count);
    printDependency();
    countChars();
    printf("%s used (%d)\n", e, ex);
    b=0;
    while (remains()) {
        pick(find());
    }
    buf[b++]=0;
    printf("%s (%d)\n",buf,b);
}